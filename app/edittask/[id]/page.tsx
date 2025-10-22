"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import logo from "@/assets/logo.png";


type Task = {
  id: string;
  title: string;
  detail: string;
  is_complete: boolean;
  image_url: string;
  create_at: string;
  update_at: string;
};

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setNewImagePreview(previewUrl);
    }
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview("");
    }
  };

  const handleRemoveOldImage = async () => {
    if (!originalImageUrl) return;
    const confirmDelete = confirm("คุณต้องการลบรูปภาพเก่าหรือไม่?");
    if (!confirmDelete) return;


  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("กรุณากรอกชื่องาน");
      return;
    }
    setIsSubmitting(true);


  }

  return (
    <div className="flex flex-col w-10/12 mx-auto min-h-screen pb-10">
      <div className="flex flex-col items-center mt-20">
        <Image src={logo} alt="Logo" width={150} height={150} />
        <h1 className="text-2xl font-bold mt-5">Manage Task App</h1>
        <h1 className="text-2xl font-bold">แก้ไขงานที่ต้องทำ</h1>
      </div>

      <div className="flex flex-col justify-center mt-10 border border-gray-400 rounded-xl p-10">
        <h1 className="text-xl font-bold text-center">แก้ไขงาน</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">งานที่ทำ</label>
            <input
              className="border border-gray-300 rounded-lg p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่องาน"
              required
            />
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">รายละเอียดงานที่ทำ</label>
            <textarea
              className="border border-gray-300 rounded-lg p-2"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="ระบุรายละเอียด"
              rows={4}
            />
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">รูปภาพ</label>

            {imageUrl && !newImagePreview && (
              <div className="mt-3 flex flex-col">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-40 h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={handleRemoveOldImage}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mt-2 w-40"
                >
                  ลบรูปเก่า
                </button>
              </div>
            )}

            {newImagePreview && (
              <div className="mt-3 flex flex-col">
                <p className="text-sm text-green-600 mb-2">รูปใหม่:</p>
                <img
                  src={newImagePreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={handleRemoveNewImage}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mt-2 w-40"
                >
                  ลบรูปใหม่
                </button>
              </div>
            )}

            <div className="mt-3">
              <label
                htmlFor="image-upload"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer inline-block"
              >
                {imageUrl || newImagePreview ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพ"}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {!imageUrl && !newImagePreview && (
              <p className="text-gray-500 mt-2">ไม่มีรูปภาพ</p>
            )}
          </div>

          <div className="flex items-center mt-5">
            <label className="text-lg font-bold">สถานะงาน</label>
            <select
              className="border border-gray-300 rounded-lg p-2 ml-3"
              value={isComplete ? "complete" : "incomplete"}
              onChange={(e) => setIsComplete(e.target.value === "complete")}
            >
              <option value="incomplete">Incomplete</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div className="flex justify-center mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-700"
                } text-white font-bold py-3 px-4 rounded`}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center mt-10">
        <Link href="/alltask" className="text-blue-500 font-bold">
          {"<"} กลับไปดูงานทั้งหมด
        </Link>
      </div>
    </div>
  );
}