import { getAllTestimonials } from "@/services/Testimonials";
import TestimonialsPage from "@/components/modules/Testimonials/TestimonialsPage";
import { TTestimonial } from "@/types/testimonial";

const TestimonialsPageRoute = async () => {
  const res = await getAllTestimonials().catch(() => ({ data: [] }));
  const testimonials: TTestimonial[] = Array.isArray(res?.data) ? res.data : [];
  return <TestimonialsPage testimonials={testimonials} />;
};

export default TestimonialsPageRoute;
