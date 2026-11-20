from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.ProductionCategoryViewSet, basename="category")
router.register("portfolio", views.PortfolioFilmViewSet, basename="portfolio")
router.register("services", views.ProductionServiceViewSet, basename="service")
router.register("crew", views.CrewMemberViewSet, basename="crew")
router.register("briefs", views.ProductionBriefRequestViewSet, basename="brief")

urlpatterns = router.urls
