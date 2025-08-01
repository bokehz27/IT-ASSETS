import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function TicketFormPage() {
  const [users, setUsers] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({
    reporter_name: "",
    asset_code: "",
    problem_description: "",
    contact_phone: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // --- Logic การดึงข้อมูลและจัดการ State ยังคงเหมือนเดิม ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://172.18.1.61:5000/api/public/asset-users"
        );
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    const fetchAssets = async () => {
      try {
        const res = await axios.get(
          "http://172.18.1.61:5000/api/public/assets-list"
        );
        const options = res.data.map((asset) => ({
          value: asset.asset_code,
          label: `${asset.asset_code} ${asset.model ? `- ${asset.model}` : ""}`, // แสดง model ด้วย
        }));
        setAssetOptions(options);
      } catch (error) {
        console.error("Failed to fetch assets", error);
      }
    };

    fetchUsers();
    fetchAssets();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssetSelectChange = (selectedOption) => {
    setFormData({
      ...formData,
      asset_code: selectedOption ? selectedOption.value : "",
    });
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const submissionData = new FormData();
    submissionData.append("reporter_name", formData.reporter_name);
    submissionData.append("asset_code", formData.asset_code);
    submissionData.append("problem_description", formData.problem_description);
    submissionData.append("contact_phone", formData.contact_phone);
    if (attachment) {
      submissionData.append("attachment", attachment);
    }

    try {
      await axios.post(
        "http://172.18.1.61:5000/api/public/tickets",
        submissionData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("แจ้งปัญหาสำเร็จ!");
      navigate("/"); // สามารถเปลี่ยนเป็น /tickets เพื่อไปหน้ารายการที่สร้าง
    } catch (error) {
      console.error("Failed to submit ticket", error);
      alert("เกิดข้อผิดพลาดในการแจ้งปัญหา");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">
        แจ้งปัญหาการใช้งาน
      </h2>
      <p className="text-gray-500 mb-8">
        กรุณากรอกข้อมูลด้านล่างให้ครบถ้วนเพื่อส่งเรื่องให้เจ้าหน้าที่ตรวจสอบ
      </p>

      {/* ใช้ space-y-6 เพื่อเพิ่มระยะห่างระหว่าง Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: ข้อมูลผู้แจ้งและอุปกรณ์ */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ข้อมูลผู้แจ้งและอุปกรณ์
          </h3>
          {/* ใช้ Grid Layout 2 คอลัมน์ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                ชื่อผู้แจ้ง
              </label>
              <Select
                classNamePrefix="react-select"
                options={users.map((user) => ({ value: user, label: user }))}
                onChange={(selectedOption) =>
                  handleInputChange({
                    target: {
                      name: "reporter_name",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                value={
                  formData.reporter_name
                    ? {
                        value: formData.reporter_name,
                        label: formData.reporter_name,
                      }
                    : null
                }
                placeholder="-- ค้นหาหรือเลือกชื่อของคุณ --"
                isClearable
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                รหัสอุปกรณ์
              </label>
              <Select
                classNamePrefix="react-select"
                options={assetOptions}
                onChange={handleAssetSelectChange}
                value={assetOptions.find(
                  (option) => option.value === formData.asset_code
                )}
                placeholder="-- ค้นหาหรือเลือกรหัสอุปกรณ์ --"
                isClearable
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: รายละเอียดปัญหา */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            รายละเอียดปัญหา
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ช่องเบอร์ติดต่อจะอยู่ด้านซ้าย */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                เบอร์ติดต่อกลับ
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="เบอร์ภายใน 4 หลัก"
                className="w-full"
                required
              />
            </div>
            {/* ช่องแนบไฟล์จะอยู่ด้านขวา */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                แนบไฟล์ (ถ้ามี)
              </label>
              <div className="flex items-center gap-4">
                {/* ปุ่มที่ทำจาก Label */}
                <label htmlFor="attachment-input" className="file-input-label">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>เลือกไฟล์</span>
                </label>
                {/* ข้อความแสดงชื่อไฟล์ */}
                <span className="text-sm text-gray-500">
                  {attachment ? attachment.name : "ยังไม่ได้เลือกไฟล์"}
                </span>
              </div>
              {/* Input จริงที่ถูกซ่อนไว้ */}
              <input
                id="attachment-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* รายละเอียดปัญหาจะมีความกว้างเต็ม 2 คอลัมน์ */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                อธิบายปัญหาที่พบ
              </label>
              <textarea
                name="problem_description"
                value={formData.problem_description}
                onChange={handleInputChange}
                rows="5"
                className="w-full"
                placeholder="โปรดอธิบายปัญหาที่พบเจอโดยละเอียด..."
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: ปุ่ม Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 shadow-md hover:shadow-lg"
          >
            {submitting ? "กำลังส่ง..." : "ส่งเรื่องแจ้งซ่อม"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TicketFormPage;
