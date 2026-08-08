import {
  createDistributorSocialImage,
  distributorSocialImageAlt,
  distributorSocialImageContentType,
  distributorSocialImageSize,
} from "@/lib/content/distributor-social-image";

export const alt = distributorSocialImageAlt;
export const size = distributorSocialImageSize;
export const contentType = distributorSocialImageContentType;
export const runtime = "nodejs";

export default createDistributorSocialImage;
