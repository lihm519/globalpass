/**
 * AI 导购聊天对话框组件
 * 使用 Gemini AI 提供智能套餐推荐
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ESIMPackage } from "@/lib/data-loader";

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string; packages?: any[] }>
  >([]);

  const chatMutation = trpc.chat.ask.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          packages: data.packages,
        },
      ]);
      setQuestion("");
    },
    onError: (error) => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `抱歉，AI 服务暂时不可用：${error.message}`,
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!question.trim()) return;

    // 添加用户消息到历史
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    // 调用 AI 导购 API
    chatMutation.mutate({ question });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI 导购助手
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            问我任何关于 E-SIM 套餐的问题，我会帮您找到最优惠的选择
          </DialogDescription>
        </DialogHeader>

        {/* 聊天历史 */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 max-h-[400px]">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <p className="text-lg font-semibold mb-2">开始对话</p>
              <p className="text-sm">
                例如：
                <br />
                "去日本最便宜的套餐是什么？"
                <br />
                "有哪些无限流量的套餐？"
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-emerald-500/20 border border-emerald-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* 推荐套餐卡片 */}
                  {msg.packages && msg.packages.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-slate-400 font-semibold">
                        推荐套餐：
                      </p>
                      {msg.packages.map((pkg: any) => (
                        <a
                          key={pkg.id}
                          href={pkg.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:scale-[1.02] transition-transform"
                        >
                          <Card className="bg-white/5 border-white/10 p-3 hover:bg-white/10 hover:border-emerald-500/30 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white">
                                {pkg.country}
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-emerald-500/20 text-emerald-300 text-xs"
                              >
                                {pkg.provider}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-slate-400">
                                  {pkg.data_amount} · {pkg.validity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-400">
                                  {(() => {
                                    // 解析 raw_data 获取币种信息
                                    let currency = "USD";
                                    let currencySymbol = "$";
                                    
                                    if (pkg.raw_data) {
                                      try {
                                        const rawData = JSON.parse(pkg.raw_data);
                                        if (rawData.currency) {
                                          currency = rawData.currency;
                                          if (currency === "EUR") currencySymbol = "€";
                                          else if (currency === "SGD") currencySymbol = "S$";
                                          else if (currency === "CNY") currencySymbol = "¥";
                                          else currencySymbol = "$";
                                        }
                                      } catch (e) {
                                        console.error("解析 raw_data 失败:", e);
                                      }
                                    }
                                    
                                    return `${currencySymbol}${pkg.price} ${currency}`;
                                  })()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  点击购买 →
                                </p>
                              </div>
                            </div>
                          </Card>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* 加载状态 */}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Input
            type="text"
            placeholder="输入您的问题..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={chatMutation.isPending}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
          />
          <Button
            onClick={handleSend}
            disabled={!question.trim() || chatMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
