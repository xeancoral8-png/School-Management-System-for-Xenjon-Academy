import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Clock, Globe, Calendar, User, Save, RefreshCw, Settings, History, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type TimeSettings = {
  userId: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  breakTime: {
    start: string;
    end: string;
  };
  availabilityStatus: 'available' | 'busy' | 'away' | 'do-not-disturb';
  automaticUpdates: boolean;
  lastModified: string;
};

type UpdateTimeModuleProps = {
  user: any;
  onUserUpdate: (user: any) => void;
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Manila',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const availabilityStatuses = [
  { value: 'available', label: 'Available', color: 'bg-green-500' },
  { value: 'busy', label: 'Busy', color: 'bg-yellow-500' },
  { value: 'away', label: 'Away', color: 'bg-orange-500' },
  { value: 'do-not-disturb', label: 'Do Not Disturb', color: 'bg-red-500' }
];

export function UpdateTimeModule({ user, onUserUpdate }: UpdateTimeModuleProps) {
  const [timeSettings, setTimeSettings] = useState<TimeSettings | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [updateHistory, setUpdateHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine labels based on user role
  const isStudent = user?.role === 'student';
  const daysLabel = isStudent ? 'School Days' : 'Working Days';
  const daysSelectLabel = isStudent ? 'Select School Days' : 'Select Working Days';
  const hoursLabel = isStudent ? 'School Hours' : 'Working Hours';

  useEffect(() => {
    loadTimeSettings();
    loadUpdateHistory();
  }, [user]);

  const loadTimeSettings = () => {
    const allSettings = JSON.parse(localStorage.getItem('xenjonUserTimeSettings') || '[]');
    const userSettings = allSettings.find((settings: TimeSettings) => settings.userId === user.id);
    
    if (userSettings) {
      setTimeSettings(userSettings);
    } else {
      // Create default settings for new user
      const defaultSettings: TimeSettings = {
        userId: user.id,
        timezone: 'America/New_York',
        workingHours: {
          start: user.role === 'student' ? '08:00' : '09:00',
          end: user.role === 'student' ? '18:00' : '17:00'
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        breakTime: {
          start: '12:00',
          end: '13:00'
        },
        availabilityStatus: 'available',
        automaticUpdates: true,
        lastModified: new Date().toISOString()
      };
      setTimeSettings(defaultSettings);
      saveTimeSettings(defaultSettings);
    }
  };

  const loadUpdateHistory = () => {
    const history = JSON.parse(localStorage.getItem('xenjonUpdateHistory') || '[]');
    const userHistory = history
      .filter((entry: any) => entry.userId === user.id)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    setUpdateHistory(userHistory);
  };

  const saveTimeSettings = (settings: TimeSettings) => {
    const allSettings = JSON.parse(localStorage.getItem('xenjonUserTimeSettings') || '[]');
    const updatedSettings = allSettings.filter((s: TimeSettings) => s.userId !== user.id);
    updatedSettings.push(settings);
    localStorage.setItem('xenjonUserTimeSettings', JSON.stringify(updatedSettings));

    // Add to update history
    const history = JSON.parse(localStorage.getItem('xenjonUpdateHistory') || '[]');
    const historyEntry = {
      id: `UPD${Date.now()}`,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'Time Settings Updated',
      details: `Updated ${editingField || 'multiple fields'}`,
      timestamp: new Date().toISOString()
    };
    history.push(historyEntry);
    localStorage.setItem('xenjonUpdateHistory', JSON.stringify(history));

    // Update user's lastUpdated timestamp
    const updatedUser = { ...user, lastUpdated: new Date().toISOString() };
    onUserUpdate(updatedUser);
  };

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!timeSettings || !editingField) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedSettings = { 
      ...timeSettings, 
      lastModified: new Date().toISOString()
    };

    switch (editingField) {
      case 'timezone':
        updatedSettings.timezone = tempValue;
        break;
      case 'workingHours.start':
        updatedSettings.workingHours.start = tempValue;
        break;
      case 'workingHours.end':
        updatedSettings.workingHours.end = tempValue;
        break;
      case 'breakTime.start':
        updatedSettings.breakTime.start = tempValue;
        break;
      case 'breakTime.end':
        updatedSettings.breakTime.end = tempValue;
        break;
      case 'workingDays':
        updatedSettings.workingDays = tempValue;
        break;
      case 'availabilityStatus':
        updatedSettings.availabilityStatus = tempValue;
        break;
      case 'automaticUpdates':
        updatedSettings.automaticUpdates = tempValue;
        break;
    }

    setTimeSettings(updatedSettings);
    saveTimeSettings(updatedSettings);
    setEditingField(null);
    setTempValue(null);
    setLoading(false);
    
    toast.success('Time settings updated successfully! ⏰');
    loadUpdateHistory(); // Refresh history
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue(null);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: timeSettings?.timezone || 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!timeSettings) {
    return (
      <div className="min-h-full" style={{ backgroundColor: '#FFF8E1' }}>
        <div className="p-6">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Loading time settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const EditableField = ({ 
    label, 
    value, 
    field, 
    type = 'text',
    options = null
  }: {
    label: string;
    value: any;
    field: string;
    type?: string;
    options?: any[];
  }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            {type === 'select' && options ? (
              <Select value={tempValue} onValueChange={setTempValue}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option: any) => (
                    <SelectItem key={typeof option === 'string' ? option : option.value} 
                               value={typeof option === 'string' ? option : option.value}>
                      {typeof option === 'string' ? option : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'time' ? (
              <Input
                type="time"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1"
              />
            ) : (
              <Input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1"
              />
            )}
            <Button size="sm" onClick={handleSaveEdit} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={loading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors flex items-center justify-between"
            onClick={() => handleStartEdit(field, value)}
          >
            <span className="flex-1">
              {type === 'time' ? formatTime(value) : 
               field === 'availabilityStatus' ? 
                 availabilityStatuses.find(s => s.value === value)?.label : 
               Array.isArray(value) ? value.join(', ') : value}
            </span>
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: '#FFF8E1' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Update Time ⏰</h1>
            <p className="text-muted-foreground">
              Manage your time settings, availability, and schedule preferences
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(timeSettings.lastModified).toLocaleString()}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setTimeSettings({ ...timeSettings, lastModified: new Date().toISOString() });
              saveTimeSettings({ ...timeSettings, lastModified: new Date().toISOString() });
              toast.success('Time refreshed!');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Current Time Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {getCurrentTime()}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${availabilityStatuses.find(s => s.value === timeSettings.availabilityStatus)?.color}`} />
                <span className="text-sm text-muted-foreground">
                  {availabilityStatuses.find(s => s.value === timeSettings.availabilityStatus)?.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Zone & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Time Zone & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField
                label="Time Zone"
                value={timeSettings.timezone}
                field="timezone"
                type="select"
                options={timezones}
              />

              <EditableField
                label="Availability Status"
                value={timeSettings.availabilityStatus}
                field="availabilityStatus"
                type="select"
                options={availabilityStatuses}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Automatic Updates</Label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Enable automatic time updates</span>
                  <Switch
                    checked={timeSettings.automaticUpdates}
                    onCheckedChange={(checked) => {
                      const updated = { ...timeSettings, automaticUpdates: checked, lastModified: new Date().toISOString() };
                      setTimeSettings(updated);
                      saveTimeSettings(updated);
                      toast.success(`Automatic updates ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours / School Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {hoursLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Start Time"
                  value={timeSettings.workingHours.start}
                  field="workingHours.start"
                  type="time"
                />

                <EditableField
                  label="End Time"
                  value={timeSettings.workingHours.end}
                  field="workingHours.end"
                  type="time"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Break Start"
                  value={timeSettings.breakTime.start}
                  field="breakTime.start"
                  type="time"
                />

                <EditableField
                  label="Break End"
                  value={timeSettings.breakTime.end}
                  field="breakTime.end"
                  type="time"
                />
              </div>
            </CardContent>
          </Card>

          {/* Working Days / School Days */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {daysLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{daysSelectLabel}</Label>
                <div 
                  className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleStartEdit('workingDays', timeSettings.workingDays)}
                >
                  {editingField === 'workingDays' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map((day) => (
                          <label key={day} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempValue?.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempValue([...tempValue, day]);
                                } else {
                                  setTempValue(tempValue.filter((d: string) => d !== day));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{day}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={loading}>
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={loading}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {timeSettings.workingDays.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updateHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No update history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updateHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-1 bg-primary rounded">
                        <User className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">{entry.action}</h5>
                        <p className="text-xs text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availabilityStatuses.map((status) => (
                <Button
                  key={status.value}
                  variant={timeSettings.availabilityStatus === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const updated = { 
                      ...timeSettings, 
                      availabilityStatus: status.value as any,
                      lastModified: new Date().toISOString()
                    };
                    setTimeSettings(updated);
                    saveTimeSettings(updated);
                    toast.success(`Status changed to ${status.label}`);
                  }}
                  className="justify-start"
                >
                  <div className={`w-2 h-2 rounded-full ${status.color} mr-2`} />
                  {status.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}