"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseDB } from "@/lib/firebase_config";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase_client";

type Task = {
  id: string;
  title: string;
  detail: string;
  is_complete: boolean;
  image_url: string;
  create_at?: string;
  update_at?: string;
};

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch task data
  useEffect(() => {
    async function fetchTask() {
      try {
        const docRef = doc(firebaseDB, "tasks", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedTask: Task = {
            id: docSnap.id,
            title: data.title || "",
            detail: data.detail || "",
            is_complete: data.is_complete || false,
            image_url: data.image_url || "",
            create_at: data.create_at || "",
            update_at: data.update_at || "",
          };

          setTask(fetchedTask);
          setTitle(fetchedTask.title);
          setDetail(fetchedTask.detail);
          setIsComplete(fetchedTask.is_complete);
          setImageUrl(fetchedTask.image_url);
        } else {
          alert("ไม่พบบันทึกงานนี้");
          router.push("/alltask");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลงาน");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchTask();
  }, [id, router]);

  // 🔹 Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔹 Handle update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("กรุณากรอกชื่องาน");
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedImageUrl = imageUrl;

      // If user uploaded new image → upload to Supabase
      if (newImageFile) {
        const fileName = `${uuidv4()}-${newImageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("manageApp")
          .upload(fileName, newImageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("manageApp")
          .getPublicUrl(fileName);

        updatedImageUrl = publicUrlData.publicUrl;
      }

      // Update Firestore document
      const docRef = doc(firebaseDB, "tasks", id as string);
      await updateDoc(docRef, {
        title,
        detail,
        is_complete: isComplete,
        image_url: updatedImageUrl,
        update_at: new Date().toISOString(),
      });

      alert("อัปเดตข้อมูลงานเรียบร้อยแล้ว");
      router.push("/alltask");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลงาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">กำลังโหลดข้อมูลงาน...</p>;
  }

  if (!task) {
    return <p className="text-center mt-20">ไม่พบบันทึกงาน</p>;
  }

  return (
    <div className="flex flex-col w-10/12 mx-auto min-h-screen pb-10">
      <div className="flex flex-col items-center mt-20">
        <Image src={logo} alt="Logo" width={150} height={150} />
        <h1 className="text-2xl font-bold mt-5">Manage Task App</h1>
        <h1 className="text-2xl font-bold">แก้ไขงานที่เลือก</h1>
      </div>

      <div className="flex flex-col justify-center mt-10 border border-gray-400 rounded-xl p-10">
        <form onSubmit={handleSubmit}>
          {/* ชื่องาน */}
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

          {/* รายละเอียด */}
          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">รายละเอียดงาน</label>
            <textarea
              className="border border-gray-300 rounded-lg p-2"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="ระบุรายละเอียด"
              rows={4}
            />
          </div>

          {/* อัปโหลดรูป */}
          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">อัปโหลดรูปภาพใหม่ (ถ้ามี)</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-32 text-center mt-2 cursor-pointer"
            >
              เลือกรูป
            </label>

            {/* แสดงรูปเก่า + preview ใหม่ */}
            <div className="flex mt-3 gap-5">
              {imageUrl && !previewFile && (
                <div>
                  <p className="text-sm text-gray-500">รูปเดิม:</p>
                  <img
                    src={imageUrl}
                    alt="Old"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                </div>
              )}
              {previewFile && (
                <div>
                  <p className="text-sm text-gray-500">รูปใหม่:</p>
                  <img
                    src={previewFile}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewImageFile(null);
                      setPreviewFile("");
                    }}
                    className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    ลบรูป
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* สถานะงาน */}
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

          {/* ปุ่มบันทึก */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700"
                } text-white font-bold py-3 px-4 rounded`}
            >
              {isSubmitting ? "กำลังบันทึก..." : "อัปเดตงาน"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center mt-10">
        <Link href="/alltask" className="text-blue-500 font-bold">
          ← กลับไปดูงานทั้งหมด
        </Link>
      </div>
    </div>
  );
}
