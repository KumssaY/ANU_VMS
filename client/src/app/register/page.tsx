//src/app/register/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerVisitor } from "../actions/visitor";
import { Eye, EyeOff } from 'lucide-react';


interface FormData {
  first_name: string;
  last_name: string;
  other_names: string;
  national_id: string;
  image: File | null;
  secret_code: string;
  reason: string;
  phone_number: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    other_names: "",
    national_id: "",
    image: null,
    secret_code: "",
    reason: "",
    phone_number: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Handle file selection with preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFormData({ ...formData, image: file });

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      setShowCamera(true);
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.");
      console.error("Camera access error:", error);
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.error("Video play error:", e));
    }
  }, [showCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            setFormData({ ...formData, image: file });

            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }

            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    } else {
      toast.error("Camera not ready. Please wait a moment and try again.");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("national_id", formData.national_id);
      formDataToSend.append("secret_code", formData.secret_code);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const registrationResult = await registerVisitor(formDataToSend);

      if (registrationResult.success) {
        toast.success("Visitor registered successfully!", { autoClose: 3000 });
        router.push("/identify");
      } else {
        toast.error(registrationResult.error || "Registration failed!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred during registration!");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-6">
      <div className="bg-[#222222] p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">Visitor Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full p-3 bg-black text-white border border-gray-600 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-400">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full p-3 bg-black text-white border border-gray-600 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400">National ID</label>
            <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} required className="w-full p-3 bg-black text-white border border-gray-600 rounded-md" />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Phone Number</label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full p-3 bg-black text-white border border-gray-600 rounded-md" />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Secret Code</label>
            <div className="relative">
              <input type={showSecret ? "text" : "password"} name="secret_code" value={formData.secret_code} onChange={handleChange} required className="w-full p-3 bg-black text-white border border-gray-600 rounded-md" />
              
              <button
                type="button"
                onClick={toggleSecretVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              >
                {showSecret ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* <div>
            <label className="block text-sm text-gray-400">Photo ID</label>
            <div className="flex gap-2">
              <label className="flex-1 p-3 bg-black border border-gray-600 rounded-md cursor-pointer">
                <span className="text-yellow-400">{formData.image ? "Change Image" : "Upload Image"}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <button type="button" onClick={startCamera} className="flex-1 p-3 bg-black border border-gray-600 rounded-md text-yellow-400">
                Take Photo
              </button>
            </div>
            {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain mt-2" />}
          </div> */}

          <button type="submit" disabled={isLoading} className="w-full p-3 bg-yellow-500 text-black font-bold rounded-md mt-6">
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
