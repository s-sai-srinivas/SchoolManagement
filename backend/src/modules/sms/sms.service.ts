import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS Service for sending SMS notifications
 * Currently a placeholder - can be integrated with MSG91 or other SMS providers
 */
@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    constructor(private configService: ConfigService) {
        // Get SMS configuration from environment variables
        const apiKey = this.configService.get<string>('MSG91_API_KEY');
        const senderId = this.configService.get<string>('MSG91_SENDER_ID');

        if (!apiKey || !senderId) {
            this.logger.warn(
                'MSG91 credentials not configured. SMS sending will be logged only.',
            );
        }
    }

    /**
     * Send SMS to a mobile number
     * @param mobile - Mobile number (10 digits, no country code)
     * @param message - SMS message text
     * @returns Promise<boolean> - true if sent successfully, false otherwise
     */
    async sendSMS(mobile: string, message: string): Promise<boolean> {
        const apiKey = this.configService.get<string>('MSG91_API_KEY');
        const senderId = this.configService.get<string>('MSG91_SENDER_ID');

        // Validate mobile number (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            this.logger.error(`Invalid mobile number: ${mobile}`);
            return false;
        }

        // If credentials not configured, just log
        if (!apiKey || !senderId) {
            this.logger.log(
                `[SMS PLACEHOLDER] Would send SMS to ${mobile}: ${message}`,
            );
            return true; // Return true for placeholder
        }

        try {
            // TODO: Implement actual MSG91 API call
            // Example implementation:
            /*
            const response = await fetch('https://api.msg91.com/api/v2/sendsms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': apiKey,
                },
                body: JSON.stringify({
                    sender: senderId,
                    route: '4', // Transactional route
                    country: '91', // India country code
                    sms: [{
                        message: message,
                        to: [`91${mobile}`], // Add country code
                    }],
                }),
            });

            const result = await response.json();
            if (result.type === 'success') {
                this.logger.log(`SMS sent successfully to ${mobile}`);
                return true;
            } else {
                this.logger.error(`Failed to send SMS to ${mobile}: ${result.message}`);
                return false;
            }
            */

            // Placeholder: log the SMS
            this.logger.log(`[SMS] To: ${mobile}, Message: ${message}`);
            return true;
        } catch (error) {
            this.logger.error(`Error sending SMS to ${mobile}:`, error);
            return false;
        }
    }

    /**
     * Send SMS with retry logic
     * @param mobile - Mobile number
     * @param message - SMS message
     * @param maxRetries - Maximum number of retries (default: 1)
     * @returns Promise<boolean>
     */
    async sendSMSWithRetry(
        mobile: string,
        message: string,
        maxRetries: number = 1,
    ): Promise<boolean> {
        let attempts = 0;
        while (attempts <= maxRetries) {
            const success = await this.sendSMS(mobile, message);
            if (success) {
                return true;
            }
            attempts++;
            if (attempts <= maxRetries) {
                this.logger.warn(
                    `Retrying SMS to ${mobile} (attempt ${attempts + 1}/${maxRetries + 1})`,
                );
                // Wait 2 seconds before retry
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
        return false;
    }

    /**
     * Send bulk SMS (for multiple recipients)
     * @param recipients - Array of {mobile, message} objects
     * @returns Promise<{success: number, failed: number}>
     */
    async sendBulkSMS(
        recipients: Array<{ mobile: string; message: string }>,
    ): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const recipient of recipients) {
            const result = await this.sendSMS(
                recipient.mobile,
                recipient.message,
            );
            if (result) {
                success++;
            } else {
                failed++;
            }
        }

        return { success, failed };
    }
}



