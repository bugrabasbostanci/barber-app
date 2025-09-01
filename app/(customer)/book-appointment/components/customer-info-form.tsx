import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, AlertCircle } from "lucide-react";
import { formatPhoneInput, validatePhone, type CustomerInfo } from "@/lib/stores/booking";

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: Partial<CustomerInfo>) => void;
  phoneError: string;
  onPhoneErrorChange: (error: string) => void;
}

export function CustomerInfoForm({ 
  customerInfo, 
  onCustomerInfoChange, 
  phoneError,
  onPhoneErrorChange 
}: CustomerInfoFormProps) {
  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneInput(value);
    onCustomerInfoChange({ phone: formattedPhone });
    
    // Clear error when user starts typing
    if (phoneError) {
      onPhoneErrorChange("");
    }
  };

  const handlePhoneBlur = () => {
    if (customerInfo.phone && !validatePhone(customerInfo.phone)) {
      onPhoneErrorChange("Please enter a valid phone number (e.g: 0532 123 45 67)");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <p className="text-muted-foreground text-sm">
          Enter your phone number for appointment confirmation
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="phone"
              type="tel"
              placeholder="0532 123 45 67"
              value={customerInfo.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              className={`pl-10 ${
                phoneError ? "border-destructive focus:ring-destructive" : ""
              }`}
              maxLength={16}
            />
          </div>
          
          {phoneError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {phoneError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Special Notes (optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Special requests or notes for your barber..."
            value={customerInfo.notes || ""}
            onChange={(e) => onCustomerInfoChange({ notes: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">
            <strong>Important:</strong> Your phone number will be used for appointment confirmation 
            and reminder messages.
          </div>
        </div>
      </div>
    </div>
  );
}