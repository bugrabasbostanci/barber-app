"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Calendar,
  LogOut,
  Trash2,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";


interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}


export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });



  // Generate user initials
  const getUserInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return profile.firstName.charAt(0) + profile.lastName.charAt(0);
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.email?.split("@")[0] || "User";
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileResponse = await fetch("/api/profile");

        if (profileResponse.ok) {
          const result = await profileResponse.json();
          if (result.success && result.data) {
            const userData = result.data;
            setProfile(userData);
            setEditForm({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              phone: userData.phone || "",
              email: userData.email || "",
            });
          } else {
            console.error("Invalid profile data format:", result);
          }
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
    // Reset form to original values
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
          setIsEditing(false);
          setSuccessMessage("Profile updated successfully!");
          setTimeout(() => setSuccessMessage(""), 5000);
        } else {
          console.error("Invalid update response format:", result);
          setErrorMessage("An error occurred while updating profile.");
        }
      } else {
        setErrorMessage("An error occurred while updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("An error occurred while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "Last confirmation: Do you really want to delete your account?"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccessMessage("Your account has been successfully deleted. Redirecting...");
        setTimeout(async () => {
          await signOut();
          window.location.href = "/";
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "An error occurred while deleting account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("An error occurred while deleting account.");
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-red-600">Failed to load profile.</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50 relative">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Profile</h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                isEditing ? handleCancelEdit() : setIsEditing(true)
              }
            >
              {isEditing ? (
                <X className="w-5 h-5" />
              ) : (
                <Edit className="w-5 h-5" />
              )}
            </Button>

            {/* Avatar Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Profil</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/my-appointments">
                    <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Randevularım</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <button
                    className="flex items-center w-full text-left"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Çıkış Yap</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Profile Picture */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">{getUserDisplayName()}</h2>
          <p className="text-gray-500">Member since 15/03/2024</p>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        firstName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-2">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.firstName || "Not specified"}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        lastName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-2">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.lastName || "Not specified"}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center mt-2">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{profile.phone || "Not specified"}</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">
                Email Address
              </Label>
              {isEditing && user?.isEmailUser ? (
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="mt-1"
                  type="email"
                />
              ) : (
                <div className="flex items-center mt-2">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
              )}
              {user?.isGoogleUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Email from your Google account (cannot be changed)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button for Edit Mode */}
        {isEditing && (
          <div className="mb-6">
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="flex-1 h-12 text-base bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-12 text-base font-semibold"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}


        {/* Security Actions - Only for email users */}
        {user?.isEmailUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth/reset-password">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
