"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface ChatItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Summarize architecture",
    "What is the main objective?",
    "Explain methodology",
    "What are key contributions?",
    "What are limitations?",
  ];

  useEffect(() => {
    const savedChats = localStorage.getItem("chatHistory");
    const savedFileName = localStorage.getItem("uploadedFileName");

    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }

    if (savedFileName) {
      setUploadedFileName(savedFileName);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "chatHistory",
      JSON.stringify(chatHistory)
    );
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem(
      "uploadedFileName",
      uploadedFileName
    );
  }, [uploadedFileName]);

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedFileName(file.name);
      alert("PDF uploaded successfully");
    } catch (error) {
      alert("Upload failed");
    }
  };

  const askQuestion = async (
    customQuestion?: string
  ) => {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) return;

    setLoading(true);

    try {
      const formattedHistory = chatHistory
        .slice(-4)
        .map(
          (chat) =>
            `User: ${chat.question}\nAI: ${chat.answer}`
        )
        .join("\n\n");

      const response = await axios.get(
        "http://127.0.0.1:8000/ask",
        {
          params:{
            question: finalQuestion,
            chat_history: formattedHistory
          }
        }
      );

      setChatHistory((prev) => [
        ...prev,
        {
          question: finalQuestion,
          answer: response.data.answer,
        },
      ]);

      setQuestion("");
    } catch (error) {
      alert("Failed to generate answer");
    } finally {
      setLoading(false);
    }
  };

  const summarizePaper = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/summarize"
      );

      setChatHistory((prev) => [
        ...prev,
        {
          question: "Summarize this paper",
          answer: response.data.answer,
        },
      ]);
    } catch (error) {
      alert("Summary failed");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setChatHistory([]);
    setQuestion("");
    localStorage.removeItem("chatHistory");
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-black via-slate-950 to-slate-900 text-white p-10">
      <h1 className="text-6xl font-bold text-center mb-10">
        Research Paper Copilot
      </h1>

      <div className="grid grid-cols-2 gap-8">
        {/* PDF PREVIEW */}
        <div className="bg-slate-800 p-6 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold mb-4">
            PDF Preview
          </h2>

          {uploadedFileName ? (
            <iframe
              src={`http://127.0.0.1:8000/uploads/${uploadedFileName}`}
              className="w-full h-[700px] rounded-xl bg-white"
            ></iframe>
          ) : (
            <div className="w-full h-[700px] rounded-xl bg-slate-700 flex items-center justify-center text-gray-400">
              No PDF uploaded
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {/* UPLOAD */}
          <div className="bg-slate-800 p-6 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              Upload Research Paper
            </h2>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] || null
                )
              }
              className="mb-4"
            />

            <br />

            <button
              onClick={uploadPDF}
              className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition"
            >
              Upload PDF
            </button>

            {uploadedFileName && (
              <p className="mt-4 text-lg">
                Loaded paper:{" "}
                <span className="font-bold">
                  {uploadedFileName}
                </span>
              </p>
            )}
          </div>

          {/* ASK QUESTION */}
          <div className="bg-slate-800 p-6 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              Ask Question
            </h2>

            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              placeholder="Ask anything about the paper..."
              className="w-full p-4 rounded-2xl bg-slate-900 text-white placeholder-gray-400 text-lg border border-slate-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <div className="flex flex-wrap gap-3 mt-4">
              {suggestedQuestions.map(
                (item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuestion(item);
                      askQuestion(item);
                    }}
                    className="px-4 py-2 rounded-full bg-slate-600 hover:bg-slate-500"
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => askQuestion()}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition"
              >
                {loading
                  ? "Thinking..."
                  : "Ask AI"}
              </button>

              <button
                onClick={summarizePaper}
                className="px-6 py-3 rounded-xl bg-green-500 font-bold hover:scale-105 transition"
              >
                Summarize Paper
              </button>

              <button
                onClick={newChat}
                className="px-6 py-3 rounded-xl bg-red-500 font-bold hover:scale-105 transition"
              >
                New Chat
              </button>
            </div>
          </div>

          {/* CHAT */}
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-500 px-5 py-3 rounded-2xl max-w-[70%]">
                    {chat.question}
                  </div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl">
                  <h3 className="text-xl font-bold mb-2">
                    AI Answer
                  </h3>

                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-3 text-white">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mb-2 text-white">
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="leading-8 text-lg mb-3 text-white">
                          {children}
                        </p>
                      ),
                      li: ({ children }) => (
                        <li className="ml-6 list-disc text-white mb-2 text-lg">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-white">
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {chat.answer}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}