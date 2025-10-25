'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import type { Retrospective } from '@/lib/types';

interface KPTAEntryProps {
  onSave: (retrospective: Retrospective) => void;
  onCancel: () => void;
}

interface TryItemWithAction {
  text: string;
  createAction: boolean;
  deadline?: string;
}

// Helper to get Monday of current week
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Helper to format date as YYYY-MM-DD
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Generate auto title based on type and dates
function generateTitle(type: 'weekly' | 'monthly', startDate: Date, endDate: Date): string {
  if (type === 'weekly') {
    const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Weekly Retro: ${startFormatted} - ${endFormatted}`;
  } else {
    const monthYear = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `Monthly Retro: ${monthYear}`;
  }
}

export function KPTAEntry({ onSave, onCancel }: KPTAEntryProps) {
  const today = new Date();
  const monday = getMonday(today);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState(formatDate(monday));
  const [endDate, setEndDate] = useState(formatDate(sunday));
  const [title, setTitle] = useState(generateTitle('weekly', monday, sunday));
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [keeps, setKeeps] = useState<string[]>(['']);
  const [problems, setProblems] = useState<string[]>(['']);
  const [tryItems, setTryItems] = useState<TryItemWithAction[]>([{ text: '', createAction: false }]);

  const updateItem = (list: string[], setList: (items: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const addItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, '']);
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index));
    }
  };

  const updateTryItem = (index: number, field: keyof TryItemWithAction, value: any) => {
    const newTryItems = [...tryItems];
    newTryItems[index] = { ...newTryItems[index], [field]: value };
    setTryItems(newTryItems);
  };

  const addTryItem = () => {
    setTryItems([...tryItems, { text: '', createAction: false }]);
  };

  const removeTryItem = (index: number) => {
    if (tryItems.length > 1) {
      setTryItems(tryItems.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const filledKeeps = keeps.filter(k => k.trim());
    const filledProblems = problems.filter(p => p.trim());
    const filledTryItems = tryItems.filter(t => t.text.trim());

    if (filledKeeps.length === 0 && filledProblems.length === 0) {
      toast.error('Please add at least one Keep or Problem');
      return;
    }

    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }

    const retrospectiveId = `retro-${Date.now()}`;

    // Create actions from Try items that are marked for action
    const actions = filledTryItems
      .filter(tryItem => tryItem.createAction)
      .map((tryItem, index) => ({
        id: `action-${Date.now()}-${index}`,
        text: tryItem.text,
        completed: false,
        retrospectiveId,
        createdAt: new Date().toISOString(),
        deadline: tryItem.deadline,
        fromTryItem: true,
      }));

    const retrospective: Retrospective = {
      id: retrospectiveId,
      title: title.trim(),
      type,
      startDate,
      endDate,
      date: endDate,
      keeps: filledKeeps,
      problems: filledProblems,
      tries: filledTryItems.map(t => t.text),
      actions,
    };

    onSave(retrospective);
    toast.success('Retrospective saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle>New Retrospective</CardTitle>
          <CardDescription>Reflect on your journey and create actionable next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <Label className="mb-3 block">Retrospective Type</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as 'weekly' | 'monthly')}>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="weekly"
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      type === 'weekly'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <RadioGroupItem value="weekly" id="weekly" />
                    <div>
                      <div className="text-slate-900 font-medium">Weekly</div>
                      <div className="text-slate-500 text-sm">7-day period</div>
                    </div>
                  </label>
                  <label
                    htmlFor="monthly"
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      type === 'monthly'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <RadioGroupItem value="monthly" id="monthly" />
                    <div>
                      <div className="text-slate-900 font-medium">Monthly</div>
                      <div className="text-slate-500 text-sm">Full month</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Retrospective Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsEditingTitle(true);
                }}
                onBlur={() => {
                  if (!title.trim()) {
                    setTitle(generateTitle(type, new Date(startDate), new Date(endDate)));
                    setIsEditingTitle(false);
                  }
                }}
                placeholder="e.g., Weekly Retro: Oct 20 - Oct 27, 2025"
                className="bg-white"
              />
              <p className="text-slate-500 text-sm mt-1">Auto-generated based on dates, but you can edit it</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-green-50/60 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Keep</CardTitle>
            <CardDescription className="text-green-700">What went well? What should I continue?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {keeps.map((keep, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={keep}
                  onChange={(e) => updateItem(keeps, setKeeps, index, e.target.value)}
                  placeholder="e.g., Maintained morning exercise routine"
                  className="bg-white border-green-300 focus:border-green-500"
                  rows={2}
                />
                {keeps.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(keeps, setKeeps, index)}
                    className="text-green-700 hover:text-green-900 hover:bg-green-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(keeps, setKeeps)}
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Keep
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-red-50/60 backdrop-blur-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Problem</CardTitle>
            <CardDescription className="text-red-700">What obstacles did I face? What's holding me back?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {problems.map((problem, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={problem}
                  onChange={(e) => updateItem(problems, setProblems, index, e.target.value)}
                  placeholder="e.g., Procrastinated on important tasks"
                  className="bg-white border-red-300 focus:border-red-500"
                  rows={2}
                />
                {problems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(problems, setProblems, index)}
                    className="text-red-700 hover:text-red-900 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(problems, setProblems)}
              className="w-full border-red-300 text-red-700 hover:bg-red-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Problem
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Try Items with Action Creation */}
      <Card className="bg-purple-50/60 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Try & Actions</CardTitle>
          <CardDescription className="text-purple-700">
            Add experiments to try. Check the box to create action items with deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tryItems.map((tryItem, index) => (
            <div key={index} className="space-y-3 p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex gap-2">
                <Textarea
                  value={tryItem.text}
                  onChange={(e) => updateTryItem(index, 'text', e.target.value)}
                  placeholder="e.g., Try the Pomodoro technique for focus"
                  className="bg-white border-purple-300 focus:border-purple-500"
                  rows={2}
                />
                {tryItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTryItem(index)}
                    className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {tryItem.text.trim() && (
                <div className="flex items-center gap-4 pl-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`action-${index}`}
                      checked={tryItem.createAction}
                      onCheckedChange={(checked) => updateTryItem(index, 'createAction', checked as boolean)}
                    />
                    <label
                      htmlFor={`action-${index}`}
                      className="text-purple-900 cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Create action item
                    </label>
                  </div>

                  {tryItem.createAction && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`deadline-${index}`} className="text-sm text-purple-700">
                        Deadline:
                      </Label>
                      <Input
                        id={`deadline-${index}`}
                        type="date"
                        value={tryItem.deadline || ''}
                        onChange={(e) => updateTryItem(index, 'deadline', e.target.value)}
                        className="w-40 h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addTryItem}
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Try Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Retrospective
        </Button>
      </div>
    </div>
  );
}
