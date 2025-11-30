"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Users, Plus } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function BranchesPage() {
  const { language } = useLanguage()

  // Mock branches data
  const branches = [
    { 
      id: 1, 
      name: "สาขาสยาม", 
      address: "991 สยามพารากอน ชั้น 4",
      phone: "02-123-4567",
      staff: 8,
      status: "active"
    },
    { 
      id: 2, 
      name: "สาขาทองหล่อ", 
      address: "55 ซอยทองหล่อ 13",
      phone: "02-234-5678",
      staff: 5,
      status: "active"
    },
    { 
      id: 3, 
      name: "สาขาเซ็นทรัลเวิลด์", 
      address: "เซ็นทรัลเวิลด์ ชั้น 3",
      phone: "02-345-6789",
      staff: 6,
      status: "active"
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {language === "th" ? "จัดการสาขา" : "Branch Management"}
              </h1>
              <p className="text-muted-foreground">
                {language === "th" 
                  ? `ทั้งหมด ${branches.length} สาขา`
                  : `Total ${branches.length} branches`}
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === "th" ? "เพิ่มสาขา" : "Add Branch"}
            </Button>
          </div>

          {/* Branches Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{branch.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {branch.status === "active" 
                            ? (language === "th" ? "เปิดให้บริการ" : "Active")
                            : (language === "th" ? "ปิด" : "Closed")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {branch.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {branch.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {branch.staff} {language === "th" ? "พนักงาน" : "staff members"}
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      {language === "th" ? "แก้ไข" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      {language === "th" ? "ดูรายละเอียด" : "Details"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
