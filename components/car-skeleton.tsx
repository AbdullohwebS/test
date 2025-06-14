import { Card, CardContent } from "@/components/ui/card"

export default function CarSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        </div>
      </CardContent>
      <div className="px-4 pb-4 flex gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </Card>
  )
}
