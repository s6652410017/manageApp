"use client";

import Image from "next/image";
import logo from "./../../assets/logo.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { firebaseDB } from "@/lib/firebase_config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

type Task = {
  id: string;
  title: string;
  detail: string;
  is_complete: boolean;
  image_url: string;
  create_at: string;
  update_at: string;
};

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks from Firestore
  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      try {
        const querySnapshot = await getDocs(collection(firebaseDB, "tasks"));
        if (!isMounted) return; // stop if unmounted

        const tasksData: Task[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          tasksData.push({
            id: docSnap.id,
            title: data.title || "",
            detail: data.detail || "",
            is_complete: data.is_complete || false,
            image_url: data.image_url || "",
            create_at: data.create_at || data.createAt || new Date().toISOString(),
            update_at: data.update_at || data.updateAt || new Date().toISOString(),
          });
        });

        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลงาน");
      }
    }

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Delete a task
  const handleDelete = async (task: Task) => {
    const confirmDelete = confirm(
      `คุณแน่ใจที่จะลบงานนี้หรือไม่?\n\nงานที่ต้องทำ: ${task.title}\nรายละเอียด: ${task.detail}`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(firebaseDB, "tasks", task.id));
      alert("ลบงานเรียบร้อยแล้ว");
      // Remove deleted task from state
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("เกิดข้อผิดพลาดในการลบงาน");
    }
  };

  return (
    <div className="flex flex-col w-10/12 mx-auto min-h-screen mb-10">
      <div className="flex flex-col items-center mt-20">
        <Image src={logo} alt="Logo" width={150} height={150} />
        <h1 className="text-2xl font-bold mt-5">Manage Task App</h1>
        <h1 className="text-2xl font-bold">บันทึกงานที่ต้องทำ</h1>
      </div>

      <div className="flex justify-end">
        <Link
          href="/addtask"
          className="mt-7 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        >
          เพิ่มงาน
        </Link>
      </div>

      <div className="flex flex-col mt-10">
        <table className="min-w-full border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2">รูป</th>
              <th className="border border-black p-2">งานที่ต้องทำ</th>
              <th className="border border-black p-2">รายละเอียด</th>
              <th className="border border-black p-2">สถานะ</th>
              <th className="border border-black p-2">วันที่เพิ่ม</th>
              <th className="border border-black p-2">วันที่แก้ไข</th>
              <th className="border border-black p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border border-black text-center">
                <td className="border border-black p-2">
                  {task.image_url ? (
                    <img
                      src={task.image_url}
                      alt={task.title}
                      width={50}
                      height={50}
                      className="mx-auto rounded"
                    />
                  ) : (
                    "ไม่มีรูป"
                  )}
                </td>
                <td className="border border-black p-2">{task.title}</td>
                <td className="border border-black p-2">{task.detail}</td>
                <td
                  className={`border border-black p-2 ${task.is_complete ? "bg-green-300" : "bg-red-300"
                    }`}
                >
                  {task.is_complete ? "Complete" : "Incomplete"}
                </td>
                <td className="border border-black p-2">
                  {new Date(task.create_at).toLocaleString()}
                </td>
                <td className="border border-black p-2">
                  {new Date(task.update_at).toLocaleString()}
                </td>
                <td className="border border-black p-2">
                  <Link
                    href={`/edittask/${task.id}`}
                    className="mr-2 bg-amber-400 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded"
                  >
                    แก้ไข
                  </Link>
                  <button
                    onClick={() => handleDelete(task)}
                    className="bg-red-400 hover:bg-red-700 text-white font-bold py-3 px-4 rounded cursor-pointer"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  ไม่มีงานที่ต้องแสดง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-10">
        <Link
          href="/"
          className="mt-7 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded cursor-pointer"
        >
          Go Home Page
        </Link>
      </div>
    </div>
  );
}
