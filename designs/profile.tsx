"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "./avatar";
import Link from "next/link";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Smith",
    phone: "(555) 123-4567",
    email: "john@example.com",
  });

  const [editProfile, setEditProfile] = useState(profile);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const fullName = `${profile.firstName} ${profile.lastName}`;

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
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            >
              {isEditing ? (
                <X className="w-5 h-5" />
              ) : (
                <Edit className="w-5 h-5" />
              )}
            </Button>

            {/* Avatar Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <Avatar
                name={fullName}
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
              />

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    href="/my-appointments"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">
                        My Appointments
                      </span>
                    </div>
                  </Link>

                  <Link href="/" onClick={() => setShowDropdown(false)}>
                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Home</span>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Profile Picture */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-gray-500">Member since 15/03/2024</p>
        </div>

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
                    value={editProfile.firstName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        firstName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-2">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editProfile.lastName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        lastName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-2">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.lastName}</span>
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
                  value={editProfile.phone}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, phone: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center mt-2">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">
                Email Address
              </Label>
              <div className="flex items-center mt-2">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{profile.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button for Edit Mode */}
        {isEditing && (
          <div className="mb-6">
            <div className="flex space-x-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 h-12 text-base bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-12 text-base font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Current Password
              </Label>
              <Input
                type="password"
                placeholder="Enter current password"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                New Password
              </Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Confirm New Password
              </Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-6">
            <Button
              variant="outline"
              className="w-full bg-transparent text-red-600 border-red-200"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
