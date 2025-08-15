import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { CalendarDays, Plus, Clock, MapPin, Users, Edit, Trash2, Eye, Save, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'event';
  createdBy: string;
  participants: string[];
  location?: string;
  createdAt: string;
  lastModified?: string;
};

type CalendarModuleProps = {
  user: any;
};

export function CalendarModule({ user }: CalendarModuleProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'event' as const,
    location: '',
    participants: [] as string[]
  });

  const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
  const availableUsers = users.filter((u: any) => u.id !== user.id);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const allEvents = JSON.parse(localStorage.getItem('xenjonCalendarEvents') || '[]');
    const userEvents = allEvents.filter((event: CalendarEvent) => 
      event.createdBy === user.id || event.participants.includes(user.id)
    );
    setEvents(userEvents);
  };

  const generateEventId = () => {
    return `EVT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: CalendarEvent = {
      id: generateEventId(),
      title: eventForm.title,
      description: eventForm.description,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      type: eventForm.type,
      createdBy: user.id,
      participants: eventForm.participants,
      location: eventForm.location,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // Update local state
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);

    // Update localStorage
    const allEvents = JSON.parse(localStorage.getItem('xenjonCalendarEvents') || '[]');
    const updatedAllEvents = [...allEvents, newEvent];
    localStorage.setItem('xenjonCalendarEvents', JSON.stringify(updatedAllEvents));

    // Create notifications for participants
    const notifications = JSON.parse(localStorage.getItem('xenjonNotifications') || '[]');
    eventForm.participants.forEach(participantId => {
      const notification = {
        id: `NOT${Date.now()}${participantId}`,
        userId: participantId,
        type: 'calendar',
        title: `New Event: ${eventForm.title}`,
        message: `${user.firstName} ${user.lastName} has created a new event for ${eventForm.date}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      notifications.push(notification);
    });
    localStorage.setItem('xenjonNotifications', JSON.stringify(notifications));

    toast.success('Event created successfully! 📅');
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'event',
      location: '',
      participants: []
    });
    setIsCreateEventOpen(false);
  };

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!selectedEvent || !editingField) return;

    const updatedEvent = { 
      ...selectedEvent, 
      [editingField]: tempValue,
      lastModified: new Date().toISOString()
    };

    // Update local state
    const updatedEvents = events.map(event =>
      event.id === selectedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);

    // Update localStorage
    const allEvents = JSON.parse(localStorage.getItem('xenjonCalendarEvents') || '[]');
    const updatedAllEvents = allEvents.map((event: CalendarEvent) =>
      event.id === selectedEvent.id ? updatedEvent : event
    );
    localStorage.setItem('xenjonCalendarEvents', JSON.stringify(updatedAllEvents));

    setSelectedEvent(updatedEvent);
    setEditingField(null);
    setTempValue(null);
    toast.success(`${editingField} updated successfully! ✅`);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);

    // Update localStorage
    const allEvents = JSON.parse(localStorage.getItem('xenjonCalendarEvents') || '[]');
    const updatedAllEvents = allEvents.filter((event: CalendarEvent) => event.id !== eventId);
    localStorage.setItem('xenjonCalendarEvents', JSON.stringify(updatedAllEvents));

    toast.success('Event deleted successfully');
    setSelectedEvent(null);
    setIsEventDetailsOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assignment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'exam': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const EditableField = ({ 
    label, 
    value, 
    field, 
    type = 'text',
    options = null,
    multiline = false
  }: {
    label: string;
    value: any;
    field: string;
    type?: string;
    options?: any[];
    multiline?: boolean;
  }) => {
    const isEditing = editingField === field;
    const canEdit = selectedEvent?.createdBy === user.id;
    
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
            ) : multiline ? (
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1"
                rows={3}
              />
            ) : (
              <Input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1"
              />
            )}
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className={`p-3 bg-muted rounded-lg transition-colors flex items-center justify-between ${
              canEdit ? 'cursor-pointer hover:bg-muted/80' : 'cursor-default'
            }`}
            onClick={() => canEdit && handleStartEdit(field, value)}
          >
            <span className="flex-1">
              {type === 'time' ? formatTime(value) : 
               field === 'type' ? 
                 value.charAt(0).toUpperCase() + value.slice(1) : 
               multiline && value.length > 50 ? `${value.substring(0, 50)}...` : value || 'Not set'}
            </span>
            {canEdit && <Edit className="w-4 h-4 text-muted-foreground" />}
          </div>
        )}
      </div>
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const monthDays = getDaysInMonth(selectedDate);

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Calendar 📅</h1>
            <p className="text-muted-foreground">
              Manage your schedule and events - click on events to edit them
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Add a new event to your calendar.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="Enter event title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Event Type</Label>
                      <Select value={eventForm.type} onValueChange={(value: any) => setEventForm({ ...eventForm, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event description (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Event location (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="participants">Participants</Label>
                    <Select 
                      value={eventForm.participants[0] || ''} 
                      onValueChange={(value) => setEventForm({ 
                        ...eventForm, 
                        participants: value ? [value] : [] 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add participants (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Event
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    >
                      →
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 min-h-[80px] border border-border rounded cursor-pointer hover:bg-muted/50 ${
                        day ? 'bg-background' : 'bg-muted/20'
                      } ${
                        day && day.toDateString() === new Date().toDateString() 
                          ? 'ring-2 ring-primary' 
                          : ''
                      } ${
                        day && day.toDateString() === selectedDate.toDateString()
                          ? 'bg-primary/10'
                          : ''
                      }`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium mb-1">
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {getEventsForDate(day).slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setIsEventDetailsOpen(true);
                                }}
                              >
                                {event.title}
                              </div>
                            ))}
                            {getEventsForDate(day).length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{getEventsForDate(day).length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No events for this date</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setEventForm({ 
                          ...eventForm, 
                          date: selectedDate.toISOString().split('T')[0] 
                        });
                        setIsCreateEventOpen(true);
                      }}
                    >
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventDetailsOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.createdBy === user.id && (
                              <div className="text-xs text-muted-foreground mt-1">
                                👆 Click to edit
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            {event.createdBy === user.id && (
                              <Edit className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Event Details Dialog with Inline Editing */}
        <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent?.createdBy === user.id ? 'Edit Event Details' : 'Event Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent?.createdBy === user.id 
                  ? 'Click on any field to edit it directly'
                  : 'View event information'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <EditableField
                    label="Title"
                    value={selectedEvent.title}
                    field="title"
                  />
                  
                  <EditableField
                    label="Type"
                    value={selectedEvent.type}
                    field="type"
                    type="select"
                    options={[
                      'class', 'assignment', 'exam', 'meeting', 'event'
                    ]}
                  />
                </div>

                <EditableField
                  label="Description"
                  value={selectedEvent.description}
                  field="description"
                  multiline={true}
                />

                <div className="grid grid-cols-3 gap-4">
                  <EditableField
                    label="Date"
                    value={selectedEvent.date}
                    field="date"
                    type="date"
                  />
                  
                  <EditableField
                    label="Start Time"
                    value={selectedEvent.startTime}
                    field="startTime"
                    type="time"
                  />
                  
                  <EditableField
                    label="End Time"
                    value={selectedEvent.endTime}
                    field="endTime"
                    type="time"
                  />
                </div>

                <EditableField
                  label="Location"
                  value={selectedEvent.location || ''}
                  field="location"
                />

                {selectedEvent.participants.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Participants</Label>
                    <div className="mt-1 space-y-1">
                      {selectedEvent.participants.map(participantId => {
                        const participant = users.find((u: any) => u.id === participantId);
                        return participant ? (
                          <div key={participantId} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Users className="w-4 h-4" />
                            <span>{participant.firstName} {participant.lastName}</span>
                            <Badge variant="outline">{participant.role}</Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <div>Created: {new Date(selectedEvent.createdAt).toLocaleString()}</div>
                    {selectedEvent.lastModified && (
                      <div>Modified: {new Date(selectedEvent.lastModified).toLocaleString()}</div>
                    )}
                  </div>
                  {selectedEvent.createdBy === user.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}