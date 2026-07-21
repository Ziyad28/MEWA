import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Badge, Card, CardHeader, ProgressBar } from "@/components/ui-bits";
import {
  addNotification,
  getProjects,
  recordAudit,
  saveProjects,
  usePortalData,
  type PrototypeProject,
} from "@/lib/portal-store";
import type { User } from "@/lib/auth";
import { canApproveProject, canManageProject } from "@/lib/access-control";

export function ProjectPrototypeWorkspace({ projectId, user }: { projectId: number; user: User }) {
  const { projects } = usePortalData();
  const project = projects.find((item) => item.id === projectId);
  const [task, setTask] = useState("");
  const [comment, setComment] = useState("");
  const [chat, setChat] = useState("");
  const [executionReason, setExecutionReason] = useState("");
  if (!project) return null;
  const current = project;
  const userName = user.name;
  const canManage = canManageProject(user, project);
  const canApprove = canApproveProject(user, project);

  const update = (
    next: PrototypeProject,
    notice?: string,
    action: "manage" | "approve" | "comment" = "manage",
  ) => {
    if (project.archived) return;
    if (action === "manage" && !canManage) return;
    if (action === "approve" && !canApprove) return;
    saveProjects(getProjects().map((item) => (item.id === next.id ? next : item)));
    recordAudit(
      action === "approve"
        ? "اعتماد مشروع"
        : action === "comment"
          ? "تواصل مشروع"
          : "تحديث تنفيذ المشروع",
      "مشروع",
      notice ?? `تحديث مشروع ${next.name}.`,
      next.id,
    );
    if (notice) addNotification("تحديث المشروع", notice, `/projects/${next.id}`);
  };

  const activeStage = project.stages.find((stage) => stage.status === "جارية") ?? project.stages[0];

  function addTask() {
    if (!task.trim() || !activeStage) return;
    const stages = current.stages.map((stage) =>
      stage.id === activeStage.id
        ? {
            ...stage,
            tasks: [
              ...stage.tasks,
              {
                id: Date.now(),
                title: task.trim(),
                owner: userName,
                due: current.end,
                done: false,
              },
            ],
          }
        : stage,
    );
    update({ ...current, stages }, `أضيفت مهمة جديدة إلى ${current.name}.`);
    setTask("");
  }

  function toggleTask(stageId: number, taskId: number) {
    const stages = current.stages.map((stage) => {
      if (stage.id !== stageId) return stage;
      const tasks = stage.tasks.map((item) =>
        item.id === taskId ? { ...item, done: !item.done } : item,
      );
      const progress = tasks.length
        ? Math.round((tasks.filter((item) => item.done).length / tasks.length) * 100)
        : 0;
      return {
        ...stage,
        tasks,
        progress,
        status: progress === 100 ? ("مكتملة" as const) : ("جارية" as const),
      };
    });
    const progress = Math.round(
      stages.reduce((sum, stage) => sum + stage.progress, 0) / Math.max(1, stages.length),
    );
    update(
      { ...current, stages, progress, updated: new Date().toLocaleDateString("en-CA") },
      `تغير إنجاز ${current.name} إلى ${progress}%.`,
    );
  }

  return (
    <div className="space-y-4">
      {project.delayRisk >= 50 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">تنبيه تلقائي يحتاج إجراء</div>
            <div className="text-xs mt-1">
              مؤشر التأخير {project.delayRisk}%. يوصى بمراجعة الجدول والمهام المتأخرة وخطة المعالجة
              قبل الاعتماد القادم.
            </div>
          </div>
        </div>
      )}

      {project.archived && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          المشروع مؤرشف ومتاح للقراءة فقط حتى يستعيده مسؤول المنصة.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="المراحل والمهام"
            action={
              <span className="text-xs text-muted-foreground">{project.stages.length} مراحل</span>
            }
          />
          <div className="px-5 pb-5 space-y-3">
            {project.stages.map((stage) => (
              <div key={stage.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{stage.title}</span>
                    <Badge
                      tone={
                        stage.status === "مكتملة"
                          ? "success"
                          : stage.status === "جارية"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  <span className="text-xs font-bold">{stage.progress}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={stage.progress}
                    tone={stage.progress === 100 ? "success" : "primary"}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {stage.tasks.map((item) => (
                    <button
                      key={item.id}
                      disabled={!canManage}
                      onClick={() => toggleTask(stage.id, item.id)}
                      className="w-full flex items-center gap-2 text-right text-xs rounded-lg hover:bg-accent p-2 disabled:cursor-default disabled:hover:bg-transparent"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={item.done ? "line-through text-muted-foreground" : ""}>
                        {item.title}
                      </span>
                      <span className="mr-auto text-[10px] text-muted-foreground">
                        {item.owner} · {item.due}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {canManage && (
              <div className="flex gap-2">
                <input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="أضف مهمة للمرحلة الجارية"
                  className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
                />
                <button
                  onClick={addTask}
                  className="h-10 px-4 rounded-lg bg-primary text-white inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  إضافة
                </button>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="حالة التنفيذ" />
            <div className="px-5 pb-5 space-y-3">
              <div className="flex justify-between text-xs">
                <span>نسبة الإنجاز</span>
                <strong>{project.progress}%</strong>
              </div>
              <ProgressBar value={project.progress} tone="primary" />
              {canManage && (
                <>
                  <label className="block text-xs text-muted-foreground">
                    سبب التحديث
                    <input
                      value={executionReason}
                      onChange={(event) => setExecutionReason(event.target.value)}
                      placeholder="اكتب سبب تغيير الحالة أو نسبة الإنجاز"
                      className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-foreground"
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    حالة المشروع
                    <select
                      value={project.status}
                      onChange={(event) => {
                        if (!executionReason.trim()) {
                          window.alert("اكتب سبب التحديث أولًا.");
                          return;
                        }
                        update(
                          {
                            ...project,
                            status: event.target.value as PrototypeProject["status"],
                            updated: new Date().toLocaleDateString("en-CA"),
                          },
                          `تغيرت حالة ${project.name} إلى ${event.target.value}. السبب: ${executionReason.trim()}`,
                        );
                        setExecutionReason("");
                      }}
                      className="mt-1 h-10 w-full rounded-lg border border-border px-3 bg-background text-foreground"
                    >
                      <option value="مخططة">مخططة</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="متأخرة">متأخرة</option>
                      <option value="متعثر">متعثر</option>
                      <option value="متوقف مؤقتًا">متوقف مؤقتًا</option>
                      <option value="مكتملة">مكتملة</option>
                    </select>
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    نسبة الإنجاز
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={project.progress}
                      onBlur={(event) => {
                        const nextProgress = Math.min(100, Math.max(0, Number(event.target.value)));
                        if (nextProgress === project.progress) return;
                        if (!executionReason.trim()) {
                          window.alert("اكتب سبب التحديث أولًا.");
                          event.currentTarget.value = String(project.progress);
                          return;
                        }
                        update({
                          ...project,
                          progress: nextProgress,
                          updated: new Date().toLocaleDateString("en-CA"),
                        }, `تغير إنجاز ${project.name} من ${project.progress}% إلى ${nextProgress}%. السبب: ${executionReason.trim()}`);
                        setExecutionReason("");
                      }}
                      className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-foreground"
                    />
                  </label>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="التحديثات والتعليقات" />
          <div className="px-5 pb-5">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {project.comments.map((item) => (
                <div key={item.id} className="rounded-lg bg-accent/50 p-3">
                  <div className="flex justify-between text-xs">
                    <strong>{item.author}</strong>
                    <span className="text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm mt-1">{item.text}</p>
                </div>
              ))}
            </div>
            {!project.archived && (
              <div className="mt-3 flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="اكتب تحديثًا أو تعليقًا"
                  className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
                />
                <button
                  onClick={() => {
                    if (!comment.trim()) return;
                    update(
                      {
                        ...project,
                        comments: [
                          { id: Date.now(), author: userName, text: comment.trim(), date: "الآن" },
                          ...project.comments,
                        ],
                      },
                      `أضاف ${userName} تحديثًا إلى ${project.name}.`,
                      "comment",
                    );
                    setComment("");
                  }}
                  className="h-10 px-4 rounded-lg bg-primary text-white"
                >
                  نشر
                </button>
              </div>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="الاعتمادات" />
          <div className="px-5 pb-5 space-y-3">
            {project.approvals.map((approval) => (
              <div key={approval.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{approval.title}</span>
                  <Badge
                    tone={
                      approval.status === "معتمد"
                        ? "success"
                        : approval.status === "مرفوض"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {approval.status}
                  </Badge>
                </div>
                {canApprove && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        update(
                          {
                            ...project,
                            approvals: project.approvals.map((item) =>
                              item.id === approval.id ? { ...item, status: "معتمد" } : item,
                            ),
                          },
                          `تم اعتماد ${approval.title}.`,
                          "approve",
                        )
                      }
                      className="h-8 px-3 rounded-lg bg-green-50 text-green-700 text-xs"
                    >
                      اعتماد
                    </button>
                    <button
                      onClick={() =>
                        update(
                          {
                            ...project,
                            approvals: project.approvals.map((item) =>
                              item.id === approval.id ? { ...item, status: "مرفوض" } : item,
                            ),
                          },
                          `تمت إعادة ${approval.title} للمراجعة.`,
                          "approve",
                        )
                      }
                      className="h-8 px-3 rounded-lg bg-red-50 text-red-700 text-xs"
                    >
                      إعادة للمراجعة
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="محادثة المشروع"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              مرتبطة بالمشروع
            </span>
          }
        />
        <div className="px-5 pb-5">
          <div className="h-48 overflow-y-auto rounded-xl bg-accent/30 p-4 space-y-3">
            {project.chat.map((message) => (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-xl p-3 text-sm ${message.sender === userName ? "mr-auto bg-primary text-white" : "bg-card border border-border"}`}
              >
                <div className="text-[10px] opacity-70">
                  {message.sender} · {message.time}
                </div>
                <div className="mt-1">{message.text}</div>
              </div>
            ))}
          </div>
          {!project.archived && (
            <div className="mt-3 flex gap-2">
              <input
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), document.getElementById("send-project-chat")?.click())
                }
                placeholder="اكتب رسالة لفريق المشروع"
                className="h-11 flex-1 rounded-lg border border-border px-3"
              />
              <button
                id="send-project-chat"
                onClick={() => {
                  if (!chat.trim()) return;
                  update(
                    {
                      ...project,
                      chat: [
                        ...project.chat,
                        { id: Date.now(), sender: userName, text: chat.trim(), time: "الآن" },
                      ],
                    },
                    undefined,
                    "comment",
                  );
                  setChat("");
                }}
                className="h-11 px-5 rounded-lg bg-primary text-white inline-flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                إرسال
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
