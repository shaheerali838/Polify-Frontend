import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import api from "../utils/api";
import { Button, Field, SelectField } from "../components/UIElements.jsx";

const CATEGORY_OPTIONS = [
  { value: "General", label: "General" },
  { value: "Technology", label: "Technology" },
  { value: "Sports", label: "Sports" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Education", label: "Education" },
  { value: "Business", label: "Business" },
  { value: "Health", label: "Health" },
];

const normalizeOptionsState = (value) => (Array.isArray(value) ? value : []);

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("single");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [options, setOptions] = useState(["", ""]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = new FormData();
      data.append("question", question);
      data.append("type", type);
      data.append("category", category);

      if (type === "single") data.append("options", JSON.stringify(options));
      if (type === "image") {
        images.forEach((file) => data.append("images", file));
      }

      await api.post("/polls", data);
      navigate("/my-polls");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create poll");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-5">
      <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Create poll</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
        Ask a question and collect votes from your community.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field
          label="Question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
          placeholder="What should we vote on?"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
            Category
          </span>
          <SelectField
            ariaLabel="Poll category"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
            Poll type
          </span>
          <SelectField
            ariaLabel="Poll type"
            value={type}
            onChange={setType}
            options={[
              { value: "single", label: "Multiple choice" },
              { value: "yesno", label: "Yes / No" },
              { value: "rating", label: "Rating" },
              { value: "open", label: "Open answer" },
              { value: "image", label: "Image choices" },
            ]}
          />
        </label>

        {type === "single" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
                Options
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextOptions = normalizeOptionsState(options).slice();
                  nextOptions.push("");
                  setOptions(nextOptions);
                }}
                className="text-xs text-emerald-400"
              >
                Add option
              </button>
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={option}
                  onChange={(event) =>
                    setOptions(
                      normalizeOptionsState(options).map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 rounded-xl border border-zinc-400 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOptions(
                      normalizeOptionsState(options).filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  className="rounded-xl p-2 text-zinc-500 dark:text-zinc-700 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {type === "image" && (
          <label className="grid cursor-pointer place-items-center rounded-2xl border border-dashed border-zinc-500 dark:border-zinc-700 p-8 text-center text-zinc-500 dark:text-zinc-800 dark:text-zinc-400 hover:border-emerald-500/50">
            <ImagePlus className="mb-2" />
            <span>
              {images.length
                ? `${images.length} image(s) selected`
                : "Choose at least 2 images"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                setImages(Array.from(event.target.files).slice(0, 4))
              }
            />
          </label>
        )}

        <Button disabled={busy} className="w-full justify-center">
          <Plus size={16} />
          {busy ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </div>
  );
}
