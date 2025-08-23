import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Home,
  Wrench,
  Plug,
  Droplets,
  Hammer,
  Flame,
  Video,
  Upload,
  Paperclip,
  Send,
  CalendarDays,
  Clock,
  CheckCircle2,
  CircleDot,
  CircleDashed,
  CircleCheck,
  User,
  Search,
  ExternalLink,
  FileDown,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";

/**
 * Maintenance Management — Restored & Enhanced
 * --------------------------------------------
 * This restores missing options and adds advanced tools:
 *  - Bulk select + CSV export of tickets
 *  - Rich filters (assignee, date range, has media)
 *  - Tradesperson accept/decline assignments
 *  - Parts & labour cost breakdown (auto total)
 *  - SLA targets & breach indicators by severity
 *  - Tenant confirmation toggle on completion
 *
 * Maps to backend endpoints in the monorepo:
 *  - GET/POST /tickets, POST /tickets/{id}/assign, PATCH /tickets/{id}/status
 *  - POST /documents/upload (S3 presigned), GET /documents?entity_type=ticket
 */

// ----------------------- Seed data --------------------------------
const org = { id: "org_1", name: "Acme Homes" };
const users = [
  { id: "u_owner", name: "Olivia Owner", role: "LANDLORD" },
  { id: "u_pm", name: "Paul Manager", role: "PROPERTY_MANAGER" },
  { id: "u_t1", name: "Tina Tenant", role: "TENANT" },
  { id: "u_t2", name: "Tom Tenant", role: "TENANT" },
  { id: "u_tp1", name: "Pam Plumber", role: "TRADESPERSON", trade: "plumbing" },
  { id: "u_tp2", name: "Eli Electrician", role: "TRADESPERSON", trade: "electrical" },
  { id: "u_tp3", name: "Carl Carpenter", role: "TRADESPERSON", trade: "carpentry" },
  { id: "u_tp4", name: "Ben Boiler Tech", role: "TRADESPERSON", trade: "boiler" },
];

const tradeRouting: Record<string,string> = {
  plumbing: "u_tp1",
  electrical: "u_tp2",
  carpentry: "u_tp3",
  boiler: "u_tp4",
  general: "u_pm",
};

// ----------------------- Types ------------------------------------
type Category = "plumbing" | "electrical" | "carpentry" | "boiler" | "general";
type Severity = "low" | "medium" | "high";
type Status = "Open" | "In-Progress" | "Awaiting Parts" | "Completed";

type Attachment = { id: string; kind: "image" | "video"; name: string; url: string; size?: number; mime?: string };

type Message = { id: string; at: string; author_id: string; body: string; tenant_visible?: boolean };

type Part = { id: string; name: string; qty: number; unit_price: number };

type SLA = { target_hours: number; acknowledged_at?: string | null; first_response_at?: string | null; resolved_at?: string | null };

type Ticket = {
  id: string;
  org_id: string;
  unit_id: string;
  created_by: string; // tenant user id
  category: Category;
  severity: Severity;
  description: string;
  status: Status;
  assignee_user_id?: string;
  scheduled_at?: string | null; // ISO start of appointment
  scheduled_window_hours?: number | null; // appointment window length
  completed_at?: string | null;
  cost_amount?: number | null; // pennies (labour + parts)
  labour_amount?: number | null; // pennies
  parts: Part[];
  recharge_to_tenant?: boolean;
  tenant_confirmed?: boolean; // tenant approved completion
  attachments: Attachment[];
  messages: Message[];
  sla: SLA;
  created_at: string;
  updated_at: string;
};

// ----------------------- Utils ------------------------------------
function uid(prefix = "id"){ return `${prefix}_${Math.random().toString(36).slice(2,8)}` }
function fmtDate(iso: string){ const d=new Date(iso); return d.toLocaleString("en-GB", { year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' }); }
function timeAgo(iso: string){ const s=(Date.now()-new Date(iso).getTime())/1000; if(s<60) return `${Math.floor(s)}s ago`; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago` }
function gbp(p: number){ return new Intl.NumberFormat('en-GB',{ style:'currency', currency:'GBP'}).format((p||0)/100) }
function toISODate(iso: string){ return iso.slice(0,10) }
function csvEscape(val: any): string { if(val===null||val===undefined) return ""; const s=String(val); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"': s }

const categoryMeta: Record<Category, { label: string; icon: React.ReactNode }> = {
  plumbing: { label:"Plumbing", icon:<Droplets className="h-4 w-4"/> },
  electrical: { label:"Electrical", icon:<Plug className="h-4 w-4"/> },
  carpentry: { label:"Carpentry", icon:<Hammer className="h-4 w-4"/> },
  boiler: { label:"Boiler/Heating", icon:<Flame className="h-4 w-4"/> },
  general: { label:"General", icon:<Wrench className="h-4 w-4"/> },
};

const statusMeta: Record<Status, { badge: "outline" | "secondary" | "default" | "destructive"; icon: React.ReactNode }>= {
  "Open": { badge:"secondary", icon:<CircleDot className="h-3 w-3"/> },
  "In-Progress": { badge:"outline", icon:<Clock className="h-3 w-3"/> },
  "Awaiting Parts": { badge:"outline", icon:<CircleDashed className="h-3 w-3"/> },
  "Completed": { badge:"default", icon:<CircleCheck className="h-3 w-3"/> },
}

function severityTargetHours(sev: Severity){ return sev==='high'? 4 : sev==='medium'? 24 : 72 }

// ----------------------- Seed tickets -----------------------------
const nowISO = new Date().toISOString();
const seedTickets: Ticket[] = [
  {
    id: "t_1001",
    org_id: org.id,
    unit_id: "unit_a1",
    created_by: "u_t1",
    category: "boiler",
    severity: "high",
    description: "Boiler not starting; E133 fault. No heating/hot water.",
    status: "Open",
    assignee_user_id: tradeRouting.boiler,
    scheduled_at: null,
    scheduled_window_hours: null,
    completed_at: null,
    labour_amount: null,
    parts: [],
    cost_amount: null,
    recharge_to_tenant: false,
    tenant_confirmed: false,
    attachments: [ { id: uid('att'), kind:'image', name:'fault-code.jpg', url: 'https://images.unsplash.com/photo-1521207418485-99c705420785?w=1200&q=80&auto=format&fit=crop' } ],
    messages: [ { id: uid('msg'), at: nowISO, author_id: "u_t1", body: "Happened overnight. Radiators cold.", tenant_visible: true } ],
    sla: { target_hours: severityTargetHours('high'), acknowledged_at: null, first_response_at: nowISO, resolved_at: null },
    created_at: nowISO,
    updated_at: nowISO,
  },
  {
    id: "t_1002",
    org_id: org.id,
    unit_id: "unit_a1",
    created_by: "u_t2",
    category: "electrical",
    severity: "medium",
    description: "Kitchen socket buzzing when kettle on.",
    status: "In-Progress",
    assignee_user_id: tradeRouting.electrical,
    scheduled_at: new Date(Date.now()+2*86400000).toISOString(),
    scheduled_window_hours: 2,
    completed_at: null,
    labour_amount: 5000,
    parts: [ { id: uid('part'), name: 'Socket faceplate', qty: 1, unit_price: 1200 } ],
    cost_amount: 6200,
    recharge_to_tenant: false,
    tenant_confirmed: false,
    attachments: [],
    messages: [],
    sla: { target_hours: severityTargetHours('medium'), acknowledged_at: nowISO, first_response_at: nowISO, resolved_at: null },
    created_at: nowISO,
    updated_at: nowISO,
  }
];

// ----------------------- Components --------------------------------
function AttachmentPreview({ a, onOpen }: { a: Attachment; onOpen: (a: Attachment)=>void }){
  return (
    <button className="group relative rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-ring" onClick={()=>onOpen(a)} aria-label={`Open attachment ${a.name}`}>
      {a.kind==='image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.url} alt={a.name} className="h-20 w-28 object-cover" />
      ) : (
        <div className="h-20 w-28 bg-muted flex items-center justify-center">
          <Video className="h-5 w-5"/>
        </div>
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">{a.name}</span>
    </button>
  );
}

function Dropzone({ onFiles }: { onFiles: (files: File[])=>void }){
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isOver, setOver] = React.useState(false);

  function onDrop(e: React.DragEvent){
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files||[]);
    if(files.length) onFiles(files);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-sm ${isOver? 'border-primary bg-primary/5':'border-muted'}`}
      onDragOver={(e)=>{ e.preventDefault(); setOver(true); }}
      onDragLeave={()=> setOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ inputRef.current?.click(); } }}
      aria-label="Upload attachments"
    >
      <div className="flex items-center gap-2"><Upload className="h-4 w-4"/> Drop photos/videos here or</div>
      <div className="mt-2"><Button type="button" variant="secondary" size="sm" onClick={()=> inputRef.current?.click()}><Paperclip className="h-3 w-3 mr-1"/> Browse…</Button></div>
      <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e)=>{ const files = Array.from(e.target.files||[]); if(files.length) onFiles(files); }} />
    </div>
  );
}

function TicketForm({ onCreate, defaultCategory='general' as any }:{ onCreate: (t: Partial<Ticket>, files: File[])=>void; defaultCategory?: Category }){
  const [category, setCategory] = React.useState<Category>(defaultCategory);
  const [severity, setSeverity] = React.useState<Severity>('medium');
  const [description, setDescription] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);

  function handleFiles(fs: File[]){ setFiles(prev => [...prev, ...fs]); }

  function submit(){
    onCreate({ category, severity, description }, files);
    setCategory(defaultCategory); setSeverity('medium'); setDescription(''); setFiles([]);
  }

  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={(v)=> setCategory(v as Category)}>
            <SelectTrigger><SelectValue placeholder="Select category"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="carpentry">Carpentry</SelectItem>
              <SelectItem value="boiler">Boiler/Heating</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Severity</Label>
          <Select value={severity} onValueChange={(v)=> setSeverity(v as Severity)}>
            <SelectTrigger><SelectValue placeholder="Select severity"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" rows={4} value={description} onChange={(e)=> setDescription(e.target.value)} placeholder="What’s wrong? Include where and when it happens."/>
      </div>
      <div>
        <Label>Attachments (optional)</Label>
        <Dropzone onFiles={handleFiles} />
        {files.length>0 && (
          <div className="mt-2 flex flex-wrap gap-2" aria-live="polite">
            {files.map((f,i)=> (
              <div key={i} className="text-xs border rounded px-2 py-1">{f.type.startsWith('image')? '🖼️':'🎞️'} {f.name}</div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button onClick={submit}><Send className="h-4 w-4 mr-2"/>Submit Ticket</Button>
      </div>
    </div>
  );
}

function TicketRow({ t, onOpen, selected, toggle }:{ t: Ticket; onOpen: (t: Ticket)=>void; selected: boolean; toggle: (id: string)=>void }){
  const cat = categoryMeta[t.category];
  const st = statusMeta[t.status];
  const assignee = users.find(u=>u.id===t.assignee_user_id)?.name || '—';
  const mediaCount = t.attachments.length;
  const created = new Date(t.created_at);
  const ageHrs = Math.round((Date.now()-created.getTime())/3600000);
  const slaBreach = ageHrs > (t.sla?.target_hours || 24) && t.status !== 'Completed';
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-8 text-center">
        <button className="p-1" aria-label={selected? 'Deselect':'Select'} onClick={(e)=>{ e.stopPropagation(); toggle(t.id); }}>
          {selected? <CheckSquare className="h-4 w-4"/> : <Square className="h-4 w-4"/>}
        </button>
      </TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer font-medium">{t.id}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer capitalize"><span className="inline-flex items-center gap-1">{cat.icon}{cat.label}</span></TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer"><Badge variant={st.badge} className="gap-1">{st.icon}{t.status}</Badge></TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer capitalize">{t.severity}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer">{assignee}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer truncate max-w-[280px]">{t.description}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer text-center">{mediaCount || '—'}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer text-right text-xs">{toISODate(t.created_at)}</TableCell>
      <TableCell onClick={()=> onOpen(t)} className="cursor-pointer text-right text-xs">{ageHrs}h {slaBreach && <Badge variant="destructive" className="ml-1 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>SLA</Badge>}</TableCell>
    </TableRow>
  );
}

// ----------------------- Main Component ---------------------------
export default function MaintenanceManagementEnhanced(){
  const [role, setRole] = React.useState<'LANDLORD'|'PROPERTY_MANAGER'|'TRADESPERSON'|'TENANT'>('LANDLORD');
  const [tickets, setTickets] = React.useState<Ticket[]>(seedTickets);
  const [filter, setFilter] = React.useState<{ q: string; category: 'all'|Category; status: 'all'|Status; severity: 'all'|Severity; assignee: 'any'|string; from?: string; to?: string; hasMedia: boolean }>({ q:'', category:'all', status:'all', severity:'all', assignee:'any', from:'', to:'', hasMedia:false });
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  // detail dialog
  const [detail, setDetail] = React.useState<Ticket|null>(null);
  const [viewer, setViewer] = React.useState<Attachment|null>(null);

  function toggleSelected(id: string){ setSelected(prev => ({ ...prev, [id]: !prev[id] })) }
  function clearSelection(){ setSelected({}) }

  function fileToAttachment(f: File): Attachment{
    const kind = f.type.startsWith('image')? 'image' : 'video';
    const url = URL.createObjectURL(f);
    return { id: uid('att'), kind, name: f.name, url, size: f.size, mime: f.type };
  }

  function createTicketDraft(partial: Partial<Ticket>, files: File[]){
    const assignee = tradeRouting[(partial.category||'general') as string] || 'u_pm';
    const attachments = files.map(fileToAttachment);
    const now = new Date().toISOString();
    const sev = (partial.severity||'medium') as Severity;
    const t: Ticket = {
      id: uid('t'),
      org_id: org.id,
      unit_id: 'unit_a1',
      created_by: 'u_t1',
      category: (partial.category||'general') as Category,
      severity: sev,
      description: partial.description||'',
      status: 'Open',
      assignee_user_id: assignee,
      scheduled_at: null,
      scheduled_window_hours: null,
      completed_at: null,
      labour_amount: null,
      parts: [],
      cost_amount: null,
      recharge_to_tenant: false,
      tenant_confirmed: false,
      attachments,
      messages: attachments.length? [{ id: uid('msg'), at: now, author_id: 'u_t1', body: `Attached ${attachments.length} file(s).`, tenant_visible: true }] : [],
      sla: { target_hours: severityTargetHours(sev), acknowledged_at: null, first_response_at: now, resolved_at: null },
      created_at: now,
      updated_at: now,
    };
    setTickets(prev => [t, ...prev]);
  }

  function updateTicket(id: string, patch: Partial<Ticket>){
    setTickets(prev => prev.map(t => t.id===id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t));
  }

  function addMessage(id: string, body: string, tenant_visible = true){
    setTickets(prev => prev.map(t => t.id===id ? { ...t, messages:[...t.messages, { id: uid('msg'), at: new Date().toISOString(), author_id: role==='TENANT'? 'u_t1' : role==='TRADESPERSON'? (t.assignee_user_id||'u_tp1') : 'u_pm', body, tenant_visible }] } : t));
  }

  function addAttachments(id: string, files: File[]){
    const atts = files.map(fileToAttachment);
    setTickets(prev => prev.map(t => t.id===id ? { ...t, attachments:[...t.attachments, ...atts] } : t));
  }

  function addPart(id: string){
    setTickets(prev => prev.map(t => t.id===id ? { ...t, parts: [...t.parts, { id: uid('part'), name: '', qty: 1, unit_price: 0 }] } : t));
  }
  function updatePart(id: string, partId: string, patch: Partial<Part>){
    setTickets(prev => prev.map(t => t.id===id ? { ...t, parts: t.parts.map(p => p.id===partId? { ...p, ...patch }: p) } : t));
  }
  function removePart(id: string, partId: string){
    setTickets(prev => prev.map(t => t.id===id ? { ...t, parts: t.parts.filter(p => p.id!==partId) } : t));
  }
  function recomputeCost(t: Ticket){
    const partsTotal = t.parts.reduce((s,p)=> s + p.qty * p.unit_price, 0);
    const labour = t.labour_amount || 0;
    return partsTotal + labour;
  }

  function acceptAssignment(t: Ticket){
    if(role!== 'TRADESPERSON' || t.assignee_user_id && users.find(u=>u.id===t.assignee_user_id)?.role!== 'TRADESPERSON') return;
    updateTicket(t.id, { status: 'In-Progress', sla: { ...t.sla, acknowledged_at: new Date().toISOString() } });
    addMessage(t.id, 'Assignment accepted. Heading to site.', false);
  }
  function declineAssignment(t: Ticket){
    if(role!== 'TRADESPERSON') return;
    updateTicket(t.id, { assignee_user_id: 'u_pm' });
    addMessage(t.id, 'Assignment declined by tradesperson. Reassigning to PM.', false);
  }

  function filteredTickets(){
    const list = tickets.filter(t => {
      const matchQ = filter.q? (t.description.toLowerCase().includes(filter.q.toLowerCase()) || t.id.includes(filter.q)) : true;
      const matchCat = filter.category==='all' ? true : t.category === filter.category;
      const matchStatus = filter.status==='all' ? true : t.status === filter.status;
      const matchSev = filter.severity==='all' ? true : t.severity === filter.severity;
      const matchAssignee = filter.assignee==='any'? true : t.assignee_user_id === filter.assignee;
      const matchMedia = filter.hasMedia ? t.attachments.length>0 : true;
      const fromOk = filter.from? (toISODate(t.created_at) >= filter.from) : true;
      const toOk = filter.to? (toISODate(t.created_at) <= filter.to) : true;
      return matchQ && matchCat && matchStatus && matchSev && matchAssignee && matchMedia && fromOk && toOk;
    });
    // newest first
    return list.sort((a,b)=> b.created_at.localeCompare(a.created_at));
  }

  function downloadTicketsCSV(){
    const headers = ["id","category","severity","status","assignee","created_at","updated_at","scheduled_at","window_hours","parts_count","labour","cost","recharge","tenant_confirmed","attachments"];
    const rows = filteredTickets().map(t => ({
      id: t.id,
      category: t.category,
      severity: t.severity,
      status: t.status,
      assignee: users.find(u=>u.id===t.assignee_user_id)?.name || '',
      created_at: t.created_at,
      updated_at: t.updated_at,
      scheduled_at: t.scheduled_at || '',
      window_hours: t.scheduled_window_hours ?? '',
      parts_count: t.parts.length,
      labour: (t.labour_amount??0)/100,
      cost: (t.cost_amount??recomputeCost(t))/100,
      recharge: t.recharge_to_tenant? 'yes':'no',
      tenant_confirmed: t.tenant_confirmed? 'yes':'no',
      attachments: t.attachments.length,
    }));
    const bom = "\uFEFF";
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => csvEscape((r as any)[h])).join(','))].join("\n");
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `tickets_${toISODate(new Date().toISOString())}.csv`; a.click(); setTimeout(()=> URL.revokeObjectURL(url), 1000);
  }

  const list = filteredTickets();

  const roleBadge = (role==='LANDLORD'?'bg-amber-100 text-amber-800': role==='PROPERTY_MANAGER'?'bg-emerald-100 text-emerald-800': role==='TRADESPERSON'?'bg-fuchsia-100 text-fuchsia-800':'bg-sky-100 text-sky-800');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Home className="h-5 w-5"/>
          <span className="font-semibold">Maintenance — Restored & Enhanced</span>
          <div className="ml-auto flex items-center gap-2">
            <Badge className={`rounded-full px-3 py-1 text-xs ${roleBadge}`}>Role: {role}</Badge>
            <Select value={role} onValueChange={(v)=> setRole(v as any)}>
              <SelectTrigger className="w-[190px]"><SelectValue placeholder="Switch role"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="LANDLORD">Landlord</SelectItem>
                <SelectItem value="PROPERTY_MANAGER">Property Manager</SelectItem>
                <SelectItem value="TRADESPERSON">Tradesperson</SelectItem>
                <SelectItem value="TENANT">Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Compose / Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Raise a ticket (Tenant)</CardTitle>
              <CardDescription>Describe the issue and attach photos or short videos.</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketForm onCreate={createTicketDraft} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Narrow down the queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search id/description…" value={filter.q} onChange={(e)=> setFilter(f=>({...f, q: e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Category</Label>
                  <Select value={filter.category} onValueChange={(v)=> setFilter(f=>({...f, category: v as any}))}>
                    <SelectTrigger><SelectValue placeholder="Any"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="carpentry">Carpentry</SelectItem>
                      <SelectItem value="boiler">Boiler</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filter.status} onValueChange={(v)=> setFilter(f=>({...f, status: v as any}))}>
                    <SelectTrigger><SelectValue placeholder="Any"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In-Progress">In-Progress</SelectItem>
                      <SelectItem value="Awaiting Parts">Awaiting Parts</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={filter.severity} onValueChange={(v)=> setFilter(f=>({...f, severity: v as any}))}>
                    <SelectTrigger><SelectValue placeholder="Any"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select value={filter.assignee} onValueChange={(v)=> setFilter(f=>({...f, assignee: v as any}))}>
                    <SelectTrigger><SelectValue placeholder="Anyone"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Anyone</SelectItem>
                      {users.filter(u=>u.role==='TRADESPERSON' || u.role==='PROPERTY_MANAGER').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} {u.trade?`(${u.trade})`:''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>From</Label>
                  <Input type="date" value={filter.from||''} onChange={(e)=> setFilter(f=>({...f, from: e.target.value}))}/>
                </div>
                <div>
                  <Label>To</Label>
                  <Input type="date" value={filter.to||''} onChange={(e)=> setFilter(f=>({...f, to: e.target.value}))}/>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filter.hasMedia} onChange={(e)=> setFilter(f=>({...f, hasMedia: e.target.checked}))}/> With media only</label>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="secondary" onClick={()=> setFilter({ q:'', category:'all', status:'all', severity:'all', assignee:'any', from:'', to:'', hasMedia:false })}>Reset</Button>
              <Button onClick={downloadTicketsCSV}><FileDown className="h-4 w-4 mr-2"/>Export CSV</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance queue</CardTitle>
            <CardDescription>Select tickets for bulk actions, or click to review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Age / SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map(t => (
                    <TicketRow key={t.id} t={t} onOpen={setDetail} selected={!!selected[t.id]} toggle={toggleSelected}/>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{Object.values(selected).filter(Boolean).length} selected</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={clearSelection}>Clear</Button>
              <Select onValueChange={(v)=>{ const ids = Object.entries(selected).filter(([_,s])=>s).map(([id])=>id); if(!ids.length) return; setTickets(prev => prev.map(t => ids.includes(t.id)? { ...t, assignee_user_id: v } : t)); clearSelection(); }}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Bulk assign to…"/></SelectTrigger>
                <SelectContent>
                  {users.filter(u=>u.role==='TRADESPERSON' || u.role==='PROPERTY_MANAGER').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} {u.trade?`(${u.trade})`:''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(v)=>{ const ids = Object.entries(selected).filter(([_,s])=>s).map(([id])=>id); if(!ids.length) return; setTickets(prev => prev.map(t => ids.includes(t.id)? { ...t, status: v as Status } : t)); clearSelection(); }}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Bulk status…"/></SelectTrigger>
                <SelectContent>
                  {(["Open","In-Progress","Awaiting Parts","Completed"] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o)=> !o && setDetail(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ticket {detail?.id}</DialogTitle>
            <DialogDescription>Raised {detail && fmtDate(detail.created_at)} · Updated {detail && timeAgo(detail.updated_at)}</DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="grid md:grid-cols-3 gap-4">
              {/* Left: description + attachments + messages */}
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Issue</CardTitle>
                    <CardDescription className="capitalize flex items-center gap-2">{categoryMeta[detail.category].icon} {categoryMeta[detail.category].label} · Severity {detail.severity}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{detail.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Attachments</CardTitle>
                    <CardDescription>Photos and videos from tenant or tradesperson.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {detail.attachments.length===0 ? (
                      <div className="text-sm text-muted-foreground">No attachments yet.</div>
                    ): (
                      <div className="flex flex-wrap gap-2">
                        {detail.attachments.map(a => (
                          <AttachmentPreview key={a.id} a={a} onOpen={setViewer}/>
                        ))}
                      </div>
                    )}
                    <Dropzone onFiles={(fs)=> addAttachments(detail.id, fs)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Messages</CardTitle>
                    <CardDescription>Thread with tenant and assignee</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 max-h-48 overflow-auto pr-2">
                      {detail.messages.length===0 ? (
                        <div className="text-sm text-muted-foreground">No messages yet.</div>
                      ) : detail.messages.map(m => {
                        const author = users.find(u=>u.id===m.author_id);
                        return (
                          <div key={m.id} className="text-sm">
                            <div className="flex items-center gap-2"><User className="h-3 w-3"/><span className="font-medium">{author?.name||m.author_id}</span><span className="text-xs text-muted-foreground">{timeAgo(m.at)}</span>{m.tenant_visible===false && <Badge variant="outline" className="ml-1">internal</Badge>}</div>
                            <div className="pl-5">{m.body}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-end gap-2">
                      <Textarea rows={2} placeholder="Write a message…" id="msgbox"/>
                      <label className="text-xs flex items-center gap-2"><input type="checkbox" id="tenantVisible" defaultChecked/> Visible to tenant</label>
                      <Button onClick={()=>{ const msgEl=document.getElementById('msgbox') as HTMLTextAreaElement; const visEl=document.getElementById('tenantVisible') as HTMLInputElement; const v=msgEl?.value?.trim(); if(v){ addMessage(detail.id, v, !!visEl?.checked); msgEl.value=''; } }}><Send className="h-4 w-4 mr-2"/>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: triage & actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Status & SLA</CardTitle>
                    <CardDescription>Progress the ticket</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(["Open","In-Progress","Awaiting Parts","Completed"] as Status[]).map(s => (
                        <Button key={s} size="sm" variant={detail.status===s? 'default':'secondary'} onClick={()=> updateTicket(detail.id, { status: s })}>{s}</Button>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">Target response: {detail.sla.target_hours}h. {detail.status!=='Completed' && (()=>{ const created = new Date(detail.created_at).getTime(); const ageHrs = Math.round((Date.now()-created)/3600000); return ageHrs>detail.sla.target_hours? '⚠️ SLA breach': 'Within SLA'; })()}</div>
                    {role==='TRADESPERSON' && detail.assignee_user_id && users.find(u=>u.id===detail.assignee_user_id)?.role==='TRADESPERSON' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={()=> acceptAssignment(detail)}>Accept</Button>
                        <Button size="sm" variant="secondary" onClick={()=> declineAssignment(detail)}>Decline</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Assignment</CardTitle>
                    <CardDescription>Pick a tradesperson</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label>Assignee</Label>
                    <Select value={detail.assignee_user_id||''} onValueChange={(v)=> updateTicket(detail.id, { assignee_user_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose"/></SelectTrigger>
                      <SelectContent>
                        {users.filter(u=>u.role==='TRADESPERSON' || u.role==='PROPERTY_MANAGER').map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name} {u.trade? `(${u.trade})`:''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label>Schedule</Label>
                        <Input type="datetime-local" value={detail.scheduled_at? detail.scheduled_at.slice(0,16): ''} onChange={(e)=> updateTicket(detail.id, { scheduled_at: e.target.value ? new Date(e.target.value).toISOString(): null })} />
                      </div>
                      <div>
                        <Label>Window (hrs)</Label>
                        <Input type="number" min={1} step={1} value={detail.scheduled_window_hours??''} onChange={(e)=> updateTicket(detail.id, { scheduled_window_hours: e.target.value? parseInt(e.target.value): null })} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!detail.recharge_to_tenant} onChange={(e)=> updateTicket(detail.id, { recharge_to_tenant: e.target.checked })}/> Recharge cost to tenant if applicable</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!detail.tenant_confirmed} onChange={(e)=> updateTicket(detail.id, { tenant_confirmed: e.target.checked })}/> Tenant confirmed completion</label>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Parts & Labour</CardTitle>
                    <CardDescription>Break down costs (auto totals)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      {detail.parts.map(p => (
                        <div key={p.id} className="grid grid-cols-5 gap-2 items-center">
                          <Input className="col-span-2" placeholder="Part name" value={p.name} onChange={(e)=> updatePart(detail.id, p.id, { name: e.target.value })}/>
                          <Input type="number" min={1} step={1} value={p.qty} onChange={(e)=> updatePart(detail.id, p.id, { qty: parseInt(e.target.value||'1') })}/>
                          <Input type="number" min={0} step={0.01} value={(p.unit_price/100).toFixed(2)} onChange={(e)=> updatePart(detail.id, p.id, { unit_price: Math.round(parseFloat(e.target.value||'0')*100) })}/>
                          <div className="text-right text-sm">{gbp(p.qty * p.unit_price)}</div>
                          <div className="col-span-5 text-right"><Button variant="ghost" size="sm" onClick={()=> removePart(detail.id, p.id)}>Remove</Button></div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="secondary" onClick={()=> addPart(detail.id)}>Add part</Button>
                    <div className="grid grid-cols-2 gap-2 mt-2 items-end">
                      <div>
                        <Label>Labour (£)</Label>
                        <Input type="number" min={0} step={0.01} value={detail.labour_amount? (detail.labour_amount/100): ''} onChange={(e)=> updateTicket(detail.id, { labour_amount: e.target.value? Math.round(parseFloat(e.target.value)*100): null })} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Computed total</div>
                        <div className="font-semibold">{gbp(recomputeCost(detail))}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={()=> setDetail(null)}>Close</Button>
            {detail?.status!=="Completed" && <Button onClick={()=> updateTicket(detail!.id, { status:'Completed', completed_at: new Date().toISOString(), sla: { ...detail!.sla, resolved_at: new Date().toISOString() }, cost_amount: recomputeCost(detail!) })}><CheckCircle2 className="h-4 w-4 mr-2"/>Mark completed</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment viewer */}
      <Dialog open={!!viewer} onOpenChange={(o)=> !o && setViewer(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attachment</DialogTitle>
            <DialogDescription>{viewer?.name}</DialogDescription>
          </DialogHeader>
          {viewer && (
            viewer.kind==='image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewer.url} alt={viewer.name} className="w-full h-auto rounded-lg"/>
            ) : (
              <video src={viewer.url} controls className="w-full rounded-lg"/>
            )
          )}
          <DialogFooter>
            {viewer && <a className="text-sm underline flex items-center gap-1" href={viewer.url} download><ExternalLink className="h-3 w-3"/>Open original</a>}
            <Button variant="secondary" onClick={()=> setViewer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
        ⚠️ Demo only. In production: S3 uploads (pre-signed), real users & org RLS, webhook notices, and SLA timers via background jobs.
      </footer>
    </div>
  );
}
