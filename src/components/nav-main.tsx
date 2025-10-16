"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      onClick?: () => void
      isActive?: boolean
      items?: {
        title: string
        url: string
        onClick?: () => void
        isActive?: boolean
      }[]
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      {subItem.items ? (
                        <Collapsible
                          asChild
                          defaultOpen={subItem.isActive}
                          className="group/collapsible-sub"
                        >
                          <div>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                onClick={subItem.onClick}
                                className={subItem.isActive ? "bg-sidebar-accent" : ""}
                              >
                                <span>{subItem.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-sub:rotate-90" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {subItem.items.map((nestedItem) => (
                                  <SidebarMenuSubItem key={nestedItem.title}>
                                    <SidebarMenuSubButton
                                      asChild={!nestedItem.onClick}
                                      onClick={nestedItem.onClick}
                                      className={`ml-4 ${nestedItem.isActive ? "bg-sidebar-accent" : ""}`}
                                    >
                                      {nestedItem.onClick ? (
                                        <span>{nestedItem.title}</span>
                                      ) : (
                                        <a href={nestedItem.url}>
                                          <span>{nestedItem.title}</span>
                                        </a>
                                      )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ) : (
                        <SidebarMenuSubButton 
                          asChild={!subItem.onClick}
                          onClick={subItem.onClick}
                          className={subItem.isActive ? "bg-sidebar-accent" : ""}
                        >
                          {subItem.onClick ? (
                            <span>{subItem.title}</span>
                          ) : (
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          )}
                        </SidebarMenuSubButton>
                      )}
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
