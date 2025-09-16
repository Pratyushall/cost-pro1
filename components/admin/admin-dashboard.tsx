"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Database, Download, Upload } from "lucide-react";
import { SingleLineEditor } from "./editors/single-line-editor";
import { BedroomEditor } from "./editors/bedroom-editor";
import { LivingEditor } from "./editors/living-editor";
import { KitchenEditor } from "./editors/kitchen-editor";
import { PoojaEditor } from "./editors/pooja-editor";
import { AddonsEditor } from "./editors/addons-editor";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [lastPublished, setLastPublished] = useState<Date | null>(null);

  const handleExportRates = () => {
    // TODO: Implement export functionality
    console.log("[v0] Exporting rates...");
  };

  const handleImportRates = () => {
    // TODO: Implement import functionality
    console.log("[v0] Importing rates...");
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    setLastPublished(new Date());
    console.log("[v0] Publishing rates...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Admin CMS</h1>
                <p className="text-gray-600">
                  Interior Cost Estimator Management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {lastPublished && (
                <div className="text-sm text-gray-500">
                  Last published: {lastPublished.toLocaleString()}
                </div>
              )}
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-gray-300 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Rate Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleExportRates}
                variant="outline"
                className="border-gray-300 text-black hover:bg-gray-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Rates (JSON)
              </Button>
              <Button
                onClick={handleImportRates}
                variant="outline"
                className="border-gray-300 text-black hover:bg-gray-50 bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Rates (JSON)
              </Button>
              <Button
                onClick={handlePublish}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Publish Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rate Editors */}
        <Tabs defaultValue="single-line" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
            <TabsTrigger
              value="single-line"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Single Line
            </TabsTrigger>
            <TabsTrigger
              value="bedrooms"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Bedrooms
            </TabsTrigger>
            <TabsTrigger
              value="living"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Living
            </TabsTrigger>
            <TabsTrigger
              value="kitchen"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Kitchen
            </TabsTrigger>
            <TabsTrigger
              value="pooja"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pooja
            </TabsTrigger>
            <TabsTrigger
              value="addons"
              className="text-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Add-Ons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single-line">
            <SingleLineEditor />
          </TabsContent>

          <TabsContent value="bedrooms">
            <BedroomEditor />
          </TabsContent>

          <TabsContent value="living">
            <LivingEditor />
          </TabsContent>

          <TabsContent value="kitchen">
            <KitchenEditor />
          </TabsContent>

          <TabsContent value="pooja">
            <PoojaEditor />
          </TabsContent>

          <TabsContent value="addons">
            <AddonsEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
