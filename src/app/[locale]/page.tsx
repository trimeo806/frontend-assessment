import { getTranslations } from "next-intl/server"
import { SearchForm } from "@/components/search/SearchForm"
import { PopularDestinationsGrid } from "@/components/search/PopularDestinationsGrid"
import { AnimatedSection } from "@/components/shared/AnimatedSection"
import { getPopularDestinations } from "@/lib/destinations"

export default async function SearchPage() {
  const [t, destinations] = await Promise.all([
    getTranslations(),
    getPopularDestinations(),
  ])

  return (
    <main className="flex flex-col bg-secondary">
      <section className="bg-linear-to-b from-primary to-primary-dark py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-220">
          <AnimatedSection delay={0}>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white">{t("search.heading")}</h1>
              <p className="mt-2 text-base text-white/80">{t("search.subheading")}</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="w-full rounded-xl bg-white shadow-lg p-6">
              <SearchForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-secondary py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-300">
          <AnimatedSection delay={0.15}>
            <h2 className="text-2xl font-bold text-secondary-foreground mb-6">{t("popularDestinations.heading")}</h2>
          </AnimatedSection>
          <PopularDestinationsGrid destinations={destinations} />
        </div>
      </section>

      <footer className="bg-white border-t border-border mt-auto">
        <div className="mx-auto max-w-300 px-4 sm:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-secondary-foreground">
            <div>
              <div className="font-bold text-lg mb-3">SkyBook</div>
              <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
            </div>
            <div>
              <div className="font-semibold mb-3">{t("footer.company")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("footer.about")}</li>
                <li>{t("footer.careers")}</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">{t("footer.support")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("footer.helpCenter")}</li>
                <li>{t("footer.contact")}</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">{t("footer.explore")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("footer.flights")}</li>
                <li>{t("footer.hotels")}</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground text-center">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </main>
  )
}
