import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import api from '@/lib/api'

interface CopySessionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionId: string
}

const DEFAULT_OPTIONS = {
    include_memory: false,
    include_files: false,
    include_form: true,
    include_clarifications: true,
    include_metadata: true,
}

export function CopySessionDialog({ open, onOpenChange, sessionId }: CopySessionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [options, setOptions] = useState({ ...DEFAULT_OPTIONS })

    const handleCheckbox = (key: keyof typeof DEFAULT_OPTIONS) => {
        setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleCopy = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/session/${sessionId}/copy`, {
                new_name: name,
                copy_options: options,
            })
            toast.success('Session copied successfully.')
            
            setTimeout(() => {
                window.location.href = `/session/${response.data.new_session_id}`
            }, 200)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.message ||
                'Failed to copy session'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            setName('')
            setOptions({ ...DEFAULT_OPTIONS })
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Duplicate Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="copy-name">Name</Label>
                        <Input
                            id="copy-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={loading}
                            placeholder="Enter a name for the duplicated session"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Settings</Label>
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={options.include_memory}
                                    onCheckedChange={() => handleCheckbox('include_memory')}
                                    disabled={loading}
                                    id="include_memory"
                                />
                                <Label htmlFor="include_memory" className="items-center">Include memory</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={options.include_files}
                                    onCheckedChange={() => handleCheckbox('include_files')}
                                    disabled={loading}
                                    id="include_files"
                                />
                                <Label htmlFor="include_files" className="items-center">Include files</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={options.include_form}
                                    onCheckedChange={() => handleCheckbox('include_form')}
                                    disabled={loading}
                                    id="include_form"
                                />
                                <Label htmlFor="include_form" className="items-center">Include clarification form</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={options.include_clarifications}
                                    onCheckedChange={() => handleCheckbox('include_clarifications')}
                                    disabled={loading}
                                    id="include_clarifications"
                                />
                                <Label htmlFor="include_clarifications" className="items-center">Include clarifications</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={options.include_metadata}
                                    onCheckedChange={() => handleCheckbox('include_metadata')}
                                    disabled={loading}
                                    id="include_metadata"
                                />
                                <Label htmlFor="include_metadata" className="items-center">Include metadata</Label>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCopy}
                        disabled={loading || !name.trim()}
                    >
                        {loading && (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />

                        )}
                        Duplicate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 