'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        baseLanguage: 'en-US',
        targetLanguages: '',
        aiBaseUrl: '',
        aiApiKey: '',
        aiModelId: '',
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    targetLanguages: data.targetLanguages.split(',').map((s: string) => s.trim()).filter(Boolean),
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(JSON.stringify(json.error) || 'Failed to create project');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setOpen(false);
            setFormData({
                name: '',
                description: '',
                baseLanguage: 'en-US',
                targetLanguages: '',
                aiBaseUrl: '',
                aiApiKey: '',
                aiModelId: '',
            });
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Create a new translation project. Config & AI settings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="baseLanguage">Base Language</Label>
                            <Input id="baseLanguage" name="baseLanguage" value={formData.baseLanguage} onChange={handleChange} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="targetLanguages">Target Languages (comma sep)</Label>
                            <Input id="targetLanguages" name="targetLanguages" value={formData.targetLanguages} onChange={handleChange} placeholder="zh-CN, ja" className="bg-gray-800 border-gray-700" />
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4 mt-2">
                        <h4 className="text-sm font-medium mb-3">AI Configuration (Optional)</h4>
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="aiBaseUrl">Base URL</Label>
                                <Input id="aiBaseUrl" name="aiBaseUrl" value={formData.aiBaseUrl} onChange={handleChange} className="bg-gray-800 border-gray-700" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="aiModelId">Model ID</Label>
                                <Input id="aiModelId" name="aiModelId" value={formData.aiModelId} onChange={handleChange} className="bg-gray-800 border-gray-700" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="aiApiKey">API Key</Label>
                                <Input id="aiApiKey" name="aiApiKey" type="password" value={formData.aiApiKey} onChange={handleChange} className="bg-gray-800 border-gray-700" />
                            </div>
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}
                </form>

                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-500">
                        {mutation.isPending ? 'Creating...' : 'Create Project'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
