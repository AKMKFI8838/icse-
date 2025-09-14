import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  comingSoon?: boolean;
}

export function FeatureCard({ title, description, icon, href, color, comingSoon }: FeatureCardProps) {
  const CardContent = () => (
    <Card className={cn(
      "h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group",
      comingSoon ? "cursor-not-allowed opacity-60" : "hover:border-primary"
    )}>
      <CardHeader className="flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start">
            <div className={cn("p-3 rounded-lg bg-secondary mb-4")}>
              <span className={cn(color)}>{icon}</span>
            </div>
            {comingSoon && <Badge variant="outline">Coming Soon</Badge>}
          </div>
          <CardTitle className="font-headline text-xl mb-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {!comingSoon && (
          <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        )}
      </CardHeader>
    </Card>
  );

  if (comingSoon) {
    return <CardContent />;
  }

  return (
    <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
      <CardContent />
    </Link>
  );
}
