import { Module } from '@nestjs/common';
import { SecretService } from './secret.service';
import { StripeConnector } from './stripe.connector';
import { GoCardlessConnector } from './gocardless.connector';
import { PayPalConnector } from './paypal.connector';
import { SendGridConnector } from './sendgrid.connector';
import { TwilioConnector } from './twilio.connector';
import { DocuSignConnector } from './docusign.connector';
import { QuickBooksConnector } from './quickbooks.connector';
import { OAuthConnector } from './connector.interface';

export const OAUTH_CONNECTORS = 'OAUTH_CONNECTORS';

@Module({
  providers: [
    SecretService,
    StripeConnector,
    GoCardlessConnector,
    PayPalConnector,
    SendGridConnector,
    TwilioConnector,
    DocuSignConnector,
    QuickBooksConnector,
    {
      provide: OAUTH_CONNECTORS,
      useFactory: (
        stripe: StripeConnector,
        gc: GoCardlessConnector,
        paypal: PayPalConnector,
        sendgrid: SendGridConnector,
        twilio: TwilioConnector,
        docusign: DocuSignConnector,
        qb: QuickBooksConnector
      ): OAuthConnector[] => [
        stripe,
        gc,
        paypal,
        sendgrid,
        twilio,
        docusign,
        qb,
      ],
      inject: [
        StripeConnector,
        GoCardlessConnector,
        PayPalConnector,
        SendGridConnector,
        TwilioConnector,
        DocuSignConnector,
        QuickBooksConnector,
      ],
    },
  ],
  exports: [OAUTH_CONNECTORS],
})
export class IntegrationModule {}
