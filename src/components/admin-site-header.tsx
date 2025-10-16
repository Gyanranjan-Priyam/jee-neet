import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { AlertCircle, RefreshCw } from "lucide-react"

interface AdminSiteHeaderProps {
  title: string
  activeCategory?: "jee" | "neet"
  activeClass?: "11th" | "12th" | "dropper"
  storageSetupNeeded?: boolean
  onRefresh?: () => void
  onStorageSetup?: () => void
}

export function AdminSiteHeader({
  title,
  activeCategory,
  activeClass,
  storageSetupNeeded,
  onRefresh,
  onStorageSetup,
}: AdminSiteHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-gray-900">
      <div className="flex w-full items-center gap-4 px-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        
        {activeCategory && activeClass && (
          <div className="flex items-center gap-2 ml-4">
            <Badge variant="secondary" className="text-xs">
              {activeCategory.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {activeClass}
            </Badge>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {storageSetupNeeded && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStorageSetup}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Setup Storage
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="hidden sm:flex"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          <AnimatedThemeToggler className="p-2" />
        </div>
      </div>
    </header>
  )
}