"use client";

import { useRef, useState } from "react";
import { Member, MemberInput, uploadAvatar } from "@/lib/members";
import Avatar from "./Avatar";

interface Props {
  initial?: Member;
  onSave: (data: MemberInput, file?: File) => Promise<void>;
  onCancel: () => void;
}

export default function MemberForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [yearOfBirth, setYearOfBirth] = useState(
    initial?.yearOfBirth ? String(initial.yearOfBirth) : ""
  );
  const [preview, setPreview] = useState<string | undefined>(initial?.avatarUrl);
  const [file, setFile] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Vui lòng nhập tên."); return; }
    const yob = yearOfBirth ? parseInt(yearOfBirth) : undefined;
    if (yob && (yob < 1940 || yob > 2015)) {
      setError("Năm sinh không hợp lệ."); return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), yearOfBirth: yob, avatarUrl: initial?.avatarUrl }, file);
    } catch (e) {
      setError("Lưu thất bại, thử lại.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar picker */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group"
        >
          <Avatar name={name || "?"} avatarUrl={preview} size="lg" />
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
            <span className="text-white text-xs font-semibold">Đổi ảnh</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-blue-600 text-sm font-medium"
        >
          {preview ? "Đổi ảnh đại diện" : "Thêm ảnh đại diện"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Tên</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Year of birth */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Năm sinh (tuỳ chọn)</label>
        <input
          type="number"
          value={yearOfBirth}
          onChange={(e) => setYearOfBirth(e.target.value)}
          placeholder="1990"
          min={1940}
          max={2015}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-base"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-base disabled:opacity-50 shadow-sm active:scale-95 transition-transform"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}
