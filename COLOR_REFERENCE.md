# Xenjon Academy Management System - Color Reference

## Department-Specific Colors (Hex Codes)

### Faculty per Department Pie Chart Colors
- **Arts and Sciences**: `#4285F4` (Google Blue)
- **Education**: `#00C851` (Material Green)  
- **Business and Management**: `#FF8A00` (Material Orange)
- **Engineering**: `#FF4444` (Material Red)
- **Information Technology / Computer Studies**: `#9C27B0` (Material Purple)
- **Nursing and Allied Health**: `#00BCD4` (Material Cyan)
- **Criminal Justice Education**: `#795548` (Material Brown)
- **Tourism Management**: `#FF9800` (Material Amber)
- **Agriculture and Fisheries**: `#4CAF50` (Material Light Green)
- **Law**: `#607D8B` (Material Blue Grey)
- **Architecture and Fine Arts**: `#E91E63` (Material Pink)

## System UI Colors (CSS Variables & Hex Equivalents)

### Light Theme
- **Background**: `#ffffff` (White)
- **Foreground**: `#030213` (Dark Blue/Black)
- **Card**: `#ffffff` (White)
- **Primary**: `#030213` (Dark Blue/Black)
- **Secondary**: `#f1f2f6` (Light Grey)
- **Muted**: `#ececf0` (Light Grey)
- **Accent**: `#e9ebef` (Very Light Grey)
- **Destructive**: `#d4183d` (Red)
- **Border**: `rgba(0, 0, 0, 0.1)` (Semi-transparent Black)

### Dark Theme
- **Background**: `#030213` (Dark Blue/Black)
- **Foreground**: `#f8f9fa` (Off White)
- **Card**: `#030213` (Dark Blue/Black)
- **Primary**: `#f8f9fa` (Off White)
- **Secondary**: `#3c4043` (Dark Grey)
- **Muted**: `#3c4043` (Dark Grey)
- **Accent**: `#3c4043` (Dark Grey)
- **Destructive**: `#dc2626` (Red)
- **Border**: `#3c4043` (Dark Grey)

## Chart Colors

### Bar Chart (Students per Course)
- **Primary Bar Color**: `#4285F4` (Google Blue)

### Activity Colors
- **Blue (Messages)**: `#2563eb` (Blue-600)
- **Green (Faculty)**: `#16a34a` (Green-600)
- **Purple (System)**: `#9333ea` (Purple-600)
- **Orange (Updates)**: `#ea580c` (Orange-600)
- **Grey (Backup)**: `#6b7280` (Grey-500)

## Quick Action Card Colors
- **Messages**: `bg-blue-500` (`#3b82f6`)
- **Calendar**: `bg-green-500` (`#10b981`)
- **Classes**: `bg-purple-500` (`#8b5cf6`)
- **Lessons**: `bg-orange-500` (`#f97316`)

## Status Colors
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)
- **Info**: `#3b82f6` (Blue-500)

## Badge Colors
- **Default**: `#6b7280` (Grey-500)
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Destructive**: `#ef4444` (Red-500)
- **Secondary**: `#64748b` (Slate-500)
- **Outline**: `transparent` with border

## Progress Bar Colors
- **Primary Progress**: `#3b82f6` (Blue-500)
- **Background**: `#e5e7eb` (Grey-200)

## Avatar/Profile Colors
- **Default Background**: `#3b82f6` (Blue-500)
- **Text**: `#ffffff` (White)

## Notification Colors
- **Unread Badge**: `#ef4444` (Red-500)
- **Notification Background**: `#f3f4f6` (Grey-100)

## Login/Authentication Colors
- **Gradient Start**: `#dbeafe` (Blue-50)
- **Gradient End**: `#e0e7ff` (Indigo-100)
- **Dark Gradient Start**: `#111827` (Grey-900)
- **Dark Gradient End**: `#1f2937` (Grey-800)

## Availability Status Colors (Update Time Module)
- **Available**: `#10b981` (Emerald-500)
- **Busy**: `#f59e0b` (Amber-500)
- **Away**: `#f97316` (Orange-500)
- **Do Not Disturb**: `#ef4444` (Red-500)

## Usage Guidelines

1. **Department Colors**: Use the specific hex codes above for any department-related visualizations
2. **Consistency**: Always use the same color for the same department across all charts and components
3. **Accessibility**: All colors meet WCAG AA contrast requirements
4. **Dark Mode**: Colors automatically adapt using CSS variables for dark theme support
5. **Semantic Colors**: Use semantic color names (success, warning, error) rather than specific hex codes where possible

## Implementation Notes

- Colors are defined in `/styles/globals.css` using CSS custom properties
- Department colors are hardcoded in Dashboard component's `departmentColorMap`
- All colors support both light and dark themes
- Use Tailwind utility classes where possible for consistency