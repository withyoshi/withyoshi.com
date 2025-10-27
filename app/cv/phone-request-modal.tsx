"use client";

import {
  faMessage,
  faPhone,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getPhonePlaceholder,
  getPhonePlaceholderSync,
} from "@/lib/utils/phone-formats";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  // Honeypot field - should always be empty
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type PhoneRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  submittedData: ContactFormData;
};

function SuccessModal({ isOpen, onClose, submittedData }: SuccessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useSemanticElements: Backdrop should be a div, not a button */}
      <div
        aria-label="Close modal"
        className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Modal */}
      <div className="fade-in-0 slide-in-from-bottom-2 zoom-in-95 relative mx-4 w-full max-w-md animate-in rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-in-out">
        {/* Success Icon and Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <h4 className="font-bold text-2xl text-mint-600">
              Call Request Sent!
            </h4>
            <p className="text-gray-600 text-sm">
              Your call request has been sent and I will get back to you as soon
              as possible.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="flex-shrink-0 cursor-pointer text-gray-400 transition-colors duration-200 hover:text-gray-600"
            onClick={onClose}
            type="button"
          >
            <FontAwesomeIcon className="h-6 w-6" icon={faTimes} />
          </button>
        </div>

        {/* Submitted Information */}
        <div className="mb-4 space-y-2 rounded-sm border-1 border-gray-200 bg-gray-50 p-6">
          <h5 className="font-semibold">Request Details</h5>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon className="mt-1.5 text-xs" icon={faUser} />
              <div>
                <span className="font-semibold text-sm">Name</span>
                <p className="text-gray-800 text-sm">{submittedData.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FontAwesomeIcon className="mt-1.5 text-xs" icon={faPhone} />
              <div>
                <span className="font-semibold text-sm">Phone</span>
                <p className="text-gray-800 text-sm">{submittedData.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FontAwesomeIcon className="mt-1.5 text-xs" icon={faMessage} />
              <div className="flex-1">
                <span className="font-semibold text-sm">Message</span>
                <p className="break-words text-sm">{submittedData.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-mint-600 py-6 hover:bg-mint-500"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export default function PhoneRequestModal({
  isOpen,
  onClose,
}: PhoneRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(
    null
  );
  const [phonePlaceholder, setPhonePlaceholder] = useState(
    getPhonePlaceholderSync()
  );

  // Load dynamic phone placeholder on component mount
  useEffect(() => {
    const loadPhonePlaceholder = async () => {
      try {
        const placeholder = await getPhonePlaceholder();
        setPhonePlaceholder(placeholder);
      } catch (_error) {
        // Keep the default placeholder from getPhonePlaceholderSync()
      }
    };

    loadPhonePlaceholder();
  }, []);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      website: "", // Honeypot field
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot check - if website field is filled, it's likely a bot
    if (data.website && data.website.trim() !== "") {
      return; // Silently reject
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/phone-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setSubmittedData(data);
        setShowSuccessModal(true);
        form.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (_error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSubmittedData(null);
    setSubmitStatus("idle");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${showSuccessModal ? "hidden" : ""}`}
      >
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/useSemanticElements: Backdrop should be a div, not a button */}
        <div
          aria-label="Close modal"
          className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
          role="button"
          tabIndex={0}
        />

        {/* Modal */}
        <div className="fade-in-0 slide-in-from-bottom-2 zoom-in-95 relative mx-4 w-full max-w-md animate-in rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-in-out">
          {/* Header with Close button */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <h4 className="font-bold text-2xl">Request a Call</h4>
              <p className="text-gray-600 text-sm">
                My phone number is not displayed publicly for privacy reasons.
                Prefer phone conversations? Share your phone number and I will
                reach out to you.
              </p>
            </div>
            <button
              aria-label="Close modal"
              className="flex-shrink-0 cursor-pointer text-gray-400 transition-colors duration-200 hover:text-gray-600"
              onClick={onClose}
              type="button"
            >
              <FontAwesomeIcon className="h-6 w-6" icon={faTimes} />
            </button>
          </div>

          {/* Form */}
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="placeholder:text-gray-400"
                        placeholder="Your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => {
                  const hasValue = field.value && field.value.trim().length > 0;
                  const isValid = hasValue && !fieldState.error;
                  return (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className={`placeholder:text-gray-400 ${
                            isValid
                              ? "focus:border-green-500 focus:ring-0"
                              : fieldState.error
                                ? "border-red-500 focus:border-red-500 focus:ring-0"
                                : "focus:ring-0"
                          }`}
                          placeholder={phonePlaceholder}
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] placeholder:text-gray-400"
                        placeholder="Your message, e.g. introduction, reason for calling, preferred calling hours, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Honeypot field - hidden from users */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Website (leave empty)</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        tabIndex={-1}
                        type="text"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="fade-in-0 slide-in-from-top-2 mt-4 animate-in rounded border border-red-400 bg-red-100 p-3 text-red-700 text-sm duration-300">
                  Sorry, there was an error sending your call request. Please
                  try again.
                </div>
              )}

              <Button
                className="w-full py-6"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Sending..." : "Request a Call"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Success Modal - Outside main modal container */}
      {submittedData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          submittedData={submittedData}
        />
      )}
    </>
  );
}
