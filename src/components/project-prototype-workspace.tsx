import { useState } from "react";
import { Plus, ShieldCheck, Trash2, Users, CheckSquare } from "lucide-react";
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
  
  const [executionReason, setExecutionReason] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskWeight, setNewTaskWeight] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  if (!project) return null;

  const canManage = canManageProject(user, project);
  const canApprove = canApproveProject(user, project);

  const update = (
    next: PrototypeProject,
    notice?: string,
    action: "manage" | "approve" = "manage",
  ) => {
    if (project.archived) return;
    if (action === "manage" && !canManage) return;
    if (action === "approve" && !canApprove) return;
    
    saveProjects(getProjects().map((item) => (item.id === next.id ? next : item)));
    
    recordAudit(
      action === "approve" ? "اعتماد فريق المشروع" : "تحديث إدارة المشروع",
      "مشروع",
      notice ?? `تحديث مشروع ${next.name}.`,
      next.id,
    );
    if (notice) addNotification("تحديث المشروع", notice, `/projects/${next.id}`);
  };

  function addTeamMember() {
    const email = newMemberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      window.alert("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }
    if (project?.teamMembers?.includes(email)) {
      window.alert("هذا العضو موجود بالفعل في الفريق.");
      return;
    }

    const updatedMembers = [...(project?.teamMembers || []), email];
    update(
      { ...project!, teamMembers: updatedMembers },
      `تمت إضافة ${email} إلى فريق المشروع.`
    );
    setNewMemberEmail("");
  }

  function removeTeamMember(emailToRemove: string) {
    if (!window.confirm(`هل أنت متأكد من إزالة ${emailToRemove} من الفريق؟`)) return;
    const updatedMembers = (project?.teamMembers || []).filter(email => email !== emailToRemove);
    update(
      { ...project!, teamMembers: updatedMembers },
      `تمت إزالة ${emailToRemove} من فريق المشروع.`
    );
  }

  function addTask() {
    if (!newTaskTitle.trim() || !newTaskWeight || !newTaskAssignee) {
      window.alert("الرجاء تعبئة جميع بيانات المهمة (العنوان، النسبة المئوية، الموظف المسؤول).");
      return;
    }
    const weightNum = Number(newTaskWeight);
    if (weightNum <= 0 || weightNum > 100) {
      window.alert("نسبة المهمة يجب أن تكون بين 1 و 100.");
      return;
    }
    
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      weight: weightNum,
      assignee: newTaskAssignee,
      completed: false
    };

    update(
      { ...project!, tasks: [...(project!.tasks || []), newTask] },
      `تمت إضافة مهمة جديدة: ${newTaskTitle.trim()}`
    );
    
    setNewTaskTitle("");
    setNewTaskWeight("");
    setNewTaskAssignee("");
  }

  function removeTask(taskId: number) {
    if (!window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    
    const taskToRemove = project!.tasks?.find(t => t.id === taskId);
    if (!taskToRemove) return;

    let nextProgress = project!.progress;
    if (taskToRemove.completed) {
      // If it was completed, its weight was already added to progress. Removing it should drop the progress.
      nextProgress = Math.max(0, nextProgress - taskToRemove.weight);
    }

    update(
      { 
        ...project!, 
        tasks: project!.tasks!.filter(t => t.id !== taskId),
        progress: nextProgress
      },
      `تم حذف المهمة: ${taskToRemove.title}`
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Update Box */}
        <Card>
          <CardHeader title="حالة التنفيذ والنسبة العامة" />
          <div className="px-5 pb-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">نسبة الإنجاز الحالية:</span>
              <strong className="text-lg">{project.progress}%</strong>
            </div>
            <ProgressBar value={project.progress} tone="primary" />
            
            {canManage && (
              <div className="space-y-4 mt-6 bg-accent/30 p-4 rounded-xl border border-border">
                <h3 className="font-semibold text-sm">تحديث الحالة</h3>
                <label className="block text-xs font-medium text-foreground">
                  سبب التحديث (إلزامي)
                  <input
                    value={executionReason}
                    onChange={(event) => setExecutionReason(event.target.value)}
                    placeholder="اكتب مبرر تغيير النسبة أو الحالة لتوضيحه للإدارة العليا"
                    className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-foreground">
                    تحديث النسبة المئوية
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={project.progress}
                      onBlur={(event) => {
                        const nextProgress = Math.min(100, Math.max(0, Number(event.target.value)));
                        if (nextProgress === project.progress) return;
                        if (!executionReason.trim()) {
                          window.alert("يجب كتابة سبب التحديث أولاً للرجوع إليه عند الحاجة.");
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
                      className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal"
                    />
                  </label>
                  <label className="block text-xs font-medium text-foreground">
                    تغيير حالة المشروع
                    <select
                      value={project.status}
                      onChange={(event) => {
                        if (!executionReason.trim()) {
                          window.alert("يجب كتابة سبب التحديث أولاً للرجوع إليه عند الحاجة.");
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
                      className="mt-1 h-10 w-full rounded-lg border border-border px-3 bg-background font-normal"
                    >
                      <option value="مخططة">مخططة</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="متأخرة">متأخرة</option>
                      <option value="متعثر">متعثر</option>
                      <option value="متوقف مؤقتًا">متوقف مؤقتًا</option>
                      <option value="مكتملة">مكتملة</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Team Management Box */}
        <Card>
          <CardHeader title="إدارة فريق المشروع" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground mb-4">
              يمكنك إضافة أعضاء لفريقك عبر البريد الإلكتروني. الأعضاء المضافون سيتمكنون من رفع الوثائق والتحديثات، ولكنها ستظهر كـ "بانتظار الاعتماد" حتى توافق عليها.
            </p>
            
            <div className="space-y-3">
              {(project.teamMembers || []).map((email) => (
                <div key={email} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{email}</span>
                  </div>
                  {canManage && (
                    <button 
                      onClick={() => removeTeamMember(email)}
                      className="text-muted-foreground hover:text-danger p-1 rounded-md hover:bg-danger/10"
                      title="إزالة من الفريق"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {(!project.teamMembers || project.teamMembers.length === 0) && (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  لا يوجد أعضاء في الفريق حالياً.
                </div>
              )}
            </div>

            {canManage && (
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                  placeholder="البريد الإلكتروني للعضو..."
                  className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
                />
                <button
                  onClick={addTeamMember}
                  className="h-10 px-4 rounded-lg bg-primary text-white inline-flex items-center gap-2 text-sm font-semibold hover:bg-primary-dark"
                >
                  <Plus className="h-4 w-4" />
                  إضافة عضو
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {canManage && (
        <Card>
          <CardHeader title="إدارة مهام المشروع" action={<CheckSquare className="h-4 w-4 text-muted-foreground" />} />
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground mb-4">
              يمكنك تقسيم المشروع إلى مهام وتوزيعها على أعضاء الفريق. إنجاز المهمة سيرفع من نسبة إنجاز المشروع بمقدار وزنها المئوي.
            </p>

            <div className="space-y-3 mb-6">
              {(project.tasks || []).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                    <span className="text-xs text-muted-foreground">
                      مسندة إلى: {task.assignee} | وزنها: {task.weight}% | الحالة: {task.completed ? "مكتملة" : "قيد التنفيذ"}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="text-muted-foreground hover:text-danger p-1 rounded-md hover:bg-danger/10 shrink-0"
                    title="حذف المهمة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {(!project.tasks || project.tasks.length === 0) && (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  لا توجد مهام مسجلة حالياً.
                </div>
              )}
            </div>

            <div className="bg-accent/30 p-4 rounded-xl border border-border space-y-3">
              <h4 className="text-sm font-semibold mb-2">إضافة مهمة جديدة</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="عنوان المهمة..."
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                  />
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newTaskWeight}
                      onChange={(e) => setNewTaskWeight(e.target.value)}
                      placeholder="النسبة (مثال: 15)"
                      className="h-10 w-full rounded-lg border border-border px-3 text-sm pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm bg-background"
                  >
                    <option value="" disabled>الموظف المسؤول</option>
                    {(project.teamMembers || []).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    {project.manager && <option value={project.manager}>{project.manager}</option>}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={addTask}
                  className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
                >
                  إضافة المهمة
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Approvals Box */}
      <Card>
        <CardHeader title="التحديثات والملفات (بانتظار الاعتماد)" />
        <div className="px-5 pb-5">
          <p className="text-xs text-muted-foreground mt-1">
            هنا تظهر التحديثات والملفات المرفوعة. يتم مراجعتها واعتمادها من قبل مدير الإدارة أو إدارة المشاريع (PMO).
          </p>
          <div className="space-y-3">
            {project.approvals.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                لا توجد طلبات معلقة بانتظار الاعتماد.
              </div>
            )}
            {project.approvals.map((approval) => (
              <div key={approval.id} className="rounded-xl border border-border p-4 flex items-center justify-between flex-wrap gap-4 bg-card">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${approval.status === 'معتمد' ? 'bg-green-100 text-green-700' : approval.status === 'مرفوض' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{approval.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">مرفوعة بواسطة: {approval.owner}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
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
                  
                  {canApprove && approval.status === "بانتظار الاعتماد" && (
                    <div className="flex gap-2">
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
                        className="h-8 px-4 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                      >
                        اعتماد ونشر
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt("اكتب سبب الرفض:");
                          if (reason === null) return;
                          update(
                            {
                              ...project,
                              approvals: project.approvals.map((item) =>
                                item.id === approval.id ? { ...item, status: "مرفوض" } : item,
                              ),
                            },
                            `تمت إعادة ${approval.title} للمراجعة. السبب: ${reason || "لم يذكر"}`,
                            "approve",
                          );
                        }}
                        className="h-8 px-4 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 border border-red-200"
                      >
                        إعادة للفريق
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
