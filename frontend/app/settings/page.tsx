"use client";

import React, { useState, useEffect } from "react";
import { useAuth, useLogout } from "@/lib/hooks/useAuth";
import { useUpdateProfile, useDeleteAccount } from "@/lib/hooks/useUsers";
import { StampButton } from "@/components/ui/stamp-button";
import { LuggageTag } from "@/components/ui/luggage-tag";
import { ScribbleCheck } from "@/components/ui/scribble-check";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";

export default function SettingsPage() {
  const { user, authData, isLoading } = useAuth();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();

  const savedDestinations = authData?.saved_destinations || [];

  // Local state for optimistic field editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    language_pref: "en",
    photo_url: ""
  });
  
  // Track which fields are currently animating their success state
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});

  // Danger zone
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        language_pref: user.language_pref || "en",
        photo_url: user.photo_url || ""
      });
    }
  }, [user]);

  const handleBlur = (field: keyof typeof formData) => {
    if (user && formData[field] !== user[field]) {
      updateProfile.mutate(
        { [field]: formData[field] },
        {
          onSuccess: () => {
            setSavedFields(prev => ({ ...prev, [field]: true }));
          }
        }
      );
    }
  };

  const handlePhotoUpload = () => {
    // Mocking an upload by updating the URL (tape-on interaction style)
    const newPhotoUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random()}`;
    setFormData(prev => ({ ...prev, photo_url: newPhotoUrl }));
    updateProfile.mutate(
      { photo_url: newPhotoUrl },
      { onSuccess: () => setSavedFields(prev => ({ ...prev, photo_url: true })) }
    );
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === user?.email) {
      deleteAccount.mutate();
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ink/90 flex items-center justify-center">
        <PaperSkeleton className="w-[800px] h-[600px] bg-paper shadow-2xl" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-ink/95 flex items-center justify-center p-4 sm:p-8" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* The "Inside Back Cover" */}
      <div 
        className="w-full max-w-3xl bg-kraft border-4 border-kraft/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.5),0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center py-12 px-6 sm:px-16"
        style={{ borderRadius: '8px' }}
      >
        {/* Binder Spine Left */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-ink/10 border-r-2 border-black/20 shadow-[inset_-4px_0_10px_rgba(0,0,0,0.3)] z-10" />

        <div className="w-full bg-paper p-8 sm:p-12 shadow-md relative transform -rotate-1 ml-4" style={{ clipPath: 'polygon(0% 0%, 100% 1%, 99% 100%, 1% 99%)' }}>
          
          <h1 className="font-display text-4xl text-ink mb-8 border-b-2 border-dashed border-kraft pb-4">Author Profile</h1>

          <div className="space-y-8 max-w-md">
            
            {/* Avatar (Tape-on interaction) */}
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-kraft/40 border border-ink/20 shadow-sm p-2 transform rotate-2 transition-transform group-hover:rotate-0">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/30">
                    <Icons.Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              {/* Masking Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-paper/60 backdrop-blur-sm shadow-sm rotate-[-4deg] border border-ink/10" style={{ clipPath: 'polygon(0% 10%, 100% 0%, 95% 100%, 5% 90%)' }} />
              
              <button 
                onClick={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-ink/10 flex items-center justify-center transition-opacity"
              >
                <span className="bg-paper font-display text-sm px-2 py-1 shadow-sm border border-kraft">Change</span>
              </button>
              
              <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                <ScribbleCheck show={savedFields.photo_url} onComplete={() => setSavedFields(prev => ({ ...prev, photo_url: false }))} />
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-6">
              <div className="relative">
                <label className="block font-body text-xs text-ink/60 uppercase tracking-widest mb-1">Pen Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => handleBlur("name")}
                  className="w-full bg-transparent font-display text-2xl text-ink border-b-2 border-dashed border-kraft focus:border-postal outline-none pb-1"
                />
                <div className="absolute right-0 top-1/2">
                  <ScribbleCheck show={savedFields.name} onComplete={() => setSavedFields(prev => ({ ...prev, name: false }))} />
                </div>
              </div>

              <div className="relative">
                <label className="block font-body text-xs text-ink/60 uppercase tracking-widest mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => handleBlur("email")}
                  className="w-full bg-transparent font-display text-lg text-ink border-b-2 border-dashed border-kraft focus:border-postal outline-none pb-1"
                />
                <div className="absolute right-0 top-1/2">
                  <ScribbleCheck show={savedFields.email} onComplete={() => setSavedFields(prev => ({ ...prev, email: false }))} />
                </div>
              </div>

              <div className="relative">
                <label className="block font-body text-xs text-ink/60 uppercase tracking-widest mb-1">Language</label>
                <select 
                  value={formData.language_pref}
                  onChange={(e) => {
                    setFormData({ ...formData, language_pref: e.target.value });
                    // Select triggers on change, not just blur
                    updateProfile.mutate(
                      { language_pref: e.target.value },
                      { onSuccess: () => setSavedFields(prev => ({ ...prev, language_pref: true })) }
                    );
                  }}
                  className="w-full bg-kraft/10 font-body text-base text-ink border-2 border-kraft rounded-sm p-2 outline-none focus:border-postal cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ja">日本語 (Japanese)</option>
                </select>
                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                  <ScribbleCheck show={savedFields.language_pref} onComplete={() => setSavedFields(prev => ({ ...prev, language_pref: false }))} />
                </div>
              </div>
            </div>
            
            {/* Saved Destinations */}
            <div className="pt-6 border-t-2 border-dashed border-kraft">
              <h3 className="font-display text-xl text-ink mb-4">Saved Destinations</h3>
              {savedDestinations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {savedDestinations.map((city: any) => (
                    <LuggageTag key={city.id} text={city.name} className="bg-postal/10 text-postal" />
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-ink/40 italic">No bookmarked cities yet.</p>
              )}
            </div>

          </div>
        </div>

        {/* Account Actions */}
        <div className="w-full mt-12 bg-paper p-6 sm:p-8 border-2 border-dashed border-kraft shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-4 relative transform -rotate-1">
          <div>
            <h3 className="font-display text-2xl text-ink">Sign Out</h3>
            <p className="font-body text-ink/70">Ready to pack up for today?</p>
          </div>
          <StampButton 
            onClick={() => logout.mutate()} 
            disabled={logout.isPending}
            className="shrink-0 bg-ink text-paper border-ink hover:bg-ink/90"
          >
            {logout.isPending ? "Signing out..." : "Log Out"}
          </StampButton>
        </div>

        {/* Danger Zone */}
        <div className="w-full mt-12 bg-paper/90 p-8 border-4 border-dashed border-[#D3422E] ml-4 relative transform rotate-1">
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#D3422E] rounded-full flex items-center justify-center text-paper font-display text-xl shadow-sm rotate-[-10deg]">!</div>
          
          <h3 className="font-display text-2xl text-[#D3422E] mb-2">Danger Zone</h3>
          <p className="font-body text-ink/70 mb-6">Once you delete your account, there is no going back. All trips and bookmarks will be lost forever.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:flex-1">
              <label className="block font-body text-xs text-ink/60 uppercase tracking-widest mb-1">Type your email to confirm</label>
              <input 
                type="text" 
                placeholder={user.email}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-transparent font-display text-lg text-ink border-b-2 border-[#D3422E]/40 focus:border-[#D3422E] outline-none pb-1"
              />
            </div>
            <StampButton 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== user.email || deleteAccount.isPending}
              className={`
                shrink-0
                ${deleteConfirmText === user.email 
                  ? "bg-[#D3422E] text-paper border-[#D3422E] hover:bg-[#B3322E]" 
                  : "bg-kraft text-ink/40 border-kraft cursor-not-allowed"}
              `}
            >
              {deleteAccount.isPending ? "Erasing..." : "Delete Account"}
            </StampButton>
          </div>
        </div>

      </div>
    </main>
  );
}
