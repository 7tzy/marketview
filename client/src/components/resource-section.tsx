import { 
  Newspaper, 
  ArrowRightLeft, 
  ChartLine, 
  GraduationCap, 
  BarChart3,
  ChartArea,
  Search,
  Eye,
  Lightbulb,
  University,
  Shield,
  Building,
  Laptop,
  Smartphone,
  Settings,
  BadgeDollarSign,
  Star,
  FileText,
  Microscope,
  PieChart,
  Book,
  Users,
  PlayCircle,
  Award,
  MessageCircle,
  Landmark,
  Briefcase,
  Database,
  Coins,
  Globe
} from "lucide-react";

interface ResourceLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ResourceCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  links: ResourceLink[];
}

export function ResourceSection() {
  const resourceCategories: ResourceCategory[] = [
    {
      title: "News & Analysis",
      icon: Newspaper,
      links: [
        { name: "Bloomberg", url: "https://www.bloomberg.com", icon: ChartArea },
        { name: "Reuters", url: "https://www.reuters.com/business/finance", icon: Globe },
        { name: "CNBC", url: "https://www.cnbc.com", icon: Eye },
        { name: "MarketWatch", url: "https://www.marketwatch.com", icon: Eye },
        { name: "Seeking Alpha", url: "https://seekingalpha.com", icon: Search },
        { name: "Motley Fool", url: "https://www.fool.com", icon: Lightbulb }
      ]
    },
    {
      title: "Trading Platforms",
      icon: ArrowRightLeft,
      links: [
        { name: "TD Ameritrade", url: "https://www.tdameritrade.com", icon: University },
        { name: "Fidelity", url: "https://www.fidelity.com", icon: Shield },
        { name: "Charles Schwab", url: "https://www.schwab.com", icon: Building },
        { name: "E*TRADE", url: "https://www.etrade.com", icon: Laptop },
        { name: "Robinhood", url: "https://robinhood.com", icon: Smartphone },
        { name: "Interactive Brokers", url: "https://www.interactivebrokers.com", icon: Settings }
      ]
    },
    {
      title: "Market Data & Tools",
      icon: ChartLine,
      links: [
        { name: "Yahoo Finance", url: "https://finance.yahoo.com", icon: ChartArea },
        { name: "Google Finance", url: "https://www.google.com/finance", icon: BadgeDollarSign },
        { name: "Morningstar", url: "https://www.morningstar.com", icon: Star },
        { name: "SEC EDGAR", url: "https://www.sec.gov/edgar", icon: FileText },
        { name: "Finviz", url: "https://finviz.com", icon: Microscope },
        { name: "TradingView", url: "https://www.tradingview.com", icon: PieChart }
      ]
    },
    {
      title: "Research & Education",
      icon: GraduationCap,
      links: [
        { name: "Investopedia", url: "https://www.investopedia.com", icon: Book },
        { name: "Bogleheads", url: "https://www.bogleheads.org", icon: Users },
        { name: "Khan Academy", url: "https://www.khanacademy.org/economics-finance-domain", icon: PlayCircle },
        { name: "Coursera", url: "https://www.coursera.org/browse/business/finance", icon: Award },
        { name: "Reddit Investing", url: "https://www.reddit.com/r/investing", icon: MessageCircle },
        { name: "Investor.gov", url: "https://www.investor.gov", icon: Landmark }
      ]
    },
    {
      title: "Economic Data",
      icon: BarChart3,
      links: [
        { name: "Federal Reserve", url: "https://www.federalreserve.gov", icon: University },
        { name: "Bureau of Labor", url: "https://www.bls.gov", icon: Briefcase },
        { name: "US Census", url: "https://www.census.gov", icon: PieChart },
        { name: "FRED", url: "https://fred.stlouisfed.org", icon: Database },
        { name: "US Treasury", url: "https://www.treasury.gov", icon: Coins },
        { name: "IMF", url: "https://www.imf.org", icon: Globe }
      ]
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Financial Resources</h2>

      {resourceCategories.map((category) => {
        const CategoryIcon = category.icon;
        
        return (
          <div key={category.title} className="mb-10">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <CategoryIcon className="text-financial-blue mr-2 w-5 h-5" />
              {category.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.links.map((link) => {
                const LinkIcon = link.icon;
                
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card neon-hover p-4 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer rounded-2xl"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(link.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <LinkIcon className="w-6 h-6 text-professional-gray group-hover:text-financial-blue mx-auto mb-2 transition-colors" />
                    <div className="text-sm font-medium">{link.name}</div>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
