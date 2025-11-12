"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Facebook, Twitter, Mail, MessageSquare, Link as LinkIcon, Check } from "lucide-react";
import { useRegisterShareMutation } from "@/services/api/ShareApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  shareUrl: string;
  title: string;
  resourceType: 'poi' | 'circuit';
  resourceId: string;
}

const ShareButtons = ({ shareUrl, title, resourceType, resourceId }: ShareButtonsProps) => {
  const t = useTranslations("ShareButtons");
  const [registerShare] = useRegisterShareMutation();
  const [copied, setCopied] = useState(false);

  // Handle share action
  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'link') => {
    try {
      await registerShare({
        resourceType,
        resourceId,
        platform,
      }).unwrap();
      
      // Show success toast
      toast.success(t("shareSuccess") || "Partagé avec succès!", {
        description: t("shareSuccessDesc") || "Merci de partager ce contenu!",
      });
    } catch (error) {
      console.error('Error registering share:', error);
      // Still allow the share to proceed even if registration fails
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await handleShare('link');
      
      toast.success(t("linkCopied") || "Lien copié!", {
        description: t("linkCopiedDesc") || "Le lien a été copié dans le presse-papiers.",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error(t("copyError") || "Erreur", {
        description: t("copyErrorDesc") || "Impossible de copier le lien.",
      });
    }
  };

  // Share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((t("emailBody") || "Découvrez ceci:") + " " + shareUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`;

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Share2 size={20} />
        {t("title")}
      </h4>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Facebook */}
        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('facebook')}
          className="p-3 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook size={20} className="text-blue-700" />
        </a>

        {/* Twitter */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('twitter')}
          className="p-3 rounded-full bg-sky-50 hover:bg-sky-100 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter size={20} className="text-sky-500" />
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('whatsapp')}
          className="p-3 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageSquare size={20} className="text-green-600" />
        </a>

        {/* Email */}
        <a
          href={emailShareUrl}
          className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-label="Share via Email"
        >
          <Mail size={20} className="text-gray-600" />
        </a>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" />
              {t("copied") || "Copié!"}
            </>
          ) : (
            <>
              <LinkIcon size={16} />
              {t("copyLink") || "Copier le lien"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;