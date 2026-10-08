import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, TrendingDown, Users, Truck, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sprout className="h-4 w-4" />
                Reducing Food Waste Through Coordination
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Coordinate Harvests,
                <span className="text-primary"> Reduce Spoilage</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                HarvestSync connects farmers, buyers, and transporters to enable Pre-Harvest Commitments—
                ensuring your perishable crops reach buyers before they spoil.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Sprout className="h-5 w-5" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="/assets/generated/hero-harvest.dim_1200x600.png"
                alt="Fresh harvest in field"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-destructive">
              <TrendingDown className="h-6 w-6" />
              <span className="font-semibold text-lg">The Challenge</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Up to 40% of perishable crops spoil before reaching buyers
            </h2>
            <p className="text-lg text-muted-foreground">
              Poor coordination between farmers, buyers, and logistics providers leads to massive waste,
              lost revenue, and missed opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Solution: Pre-Harvest Commitments */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Introducing Pre-Harvest Commitments
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Coordinate the entire supply chain before crops are even harvested
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. List Harvest</CardTitle>
                <CardDescription>
                  Farmers list upcoming harvests with crop details, quantities, and dates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Commit to Buy</CardTitle>
                <CardDescription>
                  Buyers commit to purchasing crops before they're harvested
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Arrange Transport</CardTitle>
                <CardDescription>
                  Transporters coordinate pickup and delivery schedules in advance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Three Key Roles
            </h2>
            <p className="text-lg text-muted-foreground">
              Each role has a dedicated dashboard designed for their specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="/assets/generated/icon-farmer.dim_128x128.png"
                    alt="Farmer"
                    className="h-24 w-24"
                  />
                </div>
                <CardTitle className="text-2xl">Farmers</CardTitle>
                <CardDescription className="text-base">
                  List your upcoming harvests and receive commitments from buyers before you pick
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Create harvest listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>View buyer commitments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Track transport arrangements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="/assets/generated/icon-buyer.dim_128x128.png"
                    alt="Buyer"
                    className="h-24 w-24"
                  />
                </div>
                <CardTitle className="text-2xl">Buyers</CardTitle>
                <CardDescription className="text-base">
                  Browse available harvests and commit to purchases before crops are picked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Browse harvest listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Make pre-harvest commitments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Filter by crop, location, date</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="/assets/generated/icon-transporter.dim_128x128.png"
                    alt="Transporter"
                    className="h-24 w-24"
                  />
                </div>
                <CardTitle className="text-2xl">Transporters</CardTitle>
                <CardDescription className="text-base">
                  View committed harvests and offer logistics services for coordinated delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>View transport opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Offer pickup & delivery services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Manage active routes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Reduce Spoilage?
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join HarvestSync today and start coordinating your harvests with buyers and transporters
              </p>
              <Button size="lg" className="gap-2">
                <Sprout className="h-5 w-5" />
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
