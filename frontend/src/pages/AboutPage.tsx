import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import cofounder1 from "@/assets/team/cofounder-1.jpg";
import cofounder2 from "@/assets/team/cofounder-2.jpg";
import cofounder3 from "@/assets/team/cofounder-3.jpg";
import contributor1 from "@/assets/team/contributor-1.jpg";
import contributor2 from "@/assets/team/contributor-2.jpg";


const AboutPage = () => {
  const cofounders = [
    { name: "Akylbek Usupbaev", image: cofounder1},
    { name: "Kuman Jumashev", image: cofounder2},
    { name: "Aida Meimankanova", image: cofounder3,},
  ];

  const contributors = [
    { name: "Alikhan Maratov", image: contributor1 },
    { name: "Mehmet Zhyldyzbek", image: contributor2 },
  ];

  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Co-Founders Section */}
        <section className="mb-20">
          <h1 className="text-4xl font-bold text-manga-text text-center mb-12">
            Meet Our Co-Founders
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {cofounders.map((cofounder) => (
              <div key={cofounder.name} className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-manga-primary mb-4 shadow-lg">
                  <img
                    src={cofounder.image}
                    alt={cofounder.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-manga-text">{cofounder.name}</h3>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12 bg-manga-border" />

        {/* About Us Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-manga-text mb-6 text-center">
            About Us
          </h2>
          <div className="space-y-4 text-manga-text-muted text-lg leading-relaxed">
            <p>
              We are passionate manga enthusiasts dedicated to bringing Kyrgyz manga to fans. Our journey began with a simple mission: to create
              a platform where manga lovers can discover, read, and share their favorite stories in their native language: Kyrgyz.
            </p>
            <p>
              What started as a small project among friends has grown into a vibrant community
              of contributors. We believe in the power of storytelling and the unique
              art form that manga represents. Our platform is built with love, combining cutting-edge
              technology with a deep appreciation for Japanese culture and comics.
            </p>
            <p>
              Every day, we work tirelessly to improve our services, expand our library, and
              enhance the reading experience for our users. Your support and feedback drive us
              to become better and reach new heights in serving the manga community.
            </p>
          </div>
        </section>

        <Separator className="my-12 bg-manga-border" />

        {/* Contributors Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-manga-text mb-12 text-center">
            Our Amazing Contributors
          </h2>
          <div className="flex flex-wrap gap-12 justify-center max-w-4xl mx-auto">
            {contributors.map((contributor) => (
              <div key={contributor.name} className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-manga-border mb-3 shadow-md hover:border-manga-primary transition-colors">
                  <img
                    src={contributor.image}
                    alt={contributor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-manga-text text-center">{contributor.name}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12 bg-manga-border" />

        {/* Thank You Section */}
        <section className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold text-manga-primary mb-6">
            Special Thanks
          </h2>
          <p className="text-manga-text text-lg leading-relaxed">
            A heartfelt thank you to all the volunteers who believed in us from the beginning.
            Your dedication to translating manga and making these incredible stories accessible
            to readers around the world has been invaluable. You are the backbone of our community,
            and we couldn't have done this without your passion and hard work.
          </p>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
