import WhyUsTemplatesIcon from '@/assets/svg/Features/templates.svg';
import Ruby from '@/assets/svg/Gemstones/ruby.svg';
import Drupal from '@/assets/svg/TooltipIcons/Drupal.svg';
import Joomla from '@/assets/svg/TooltipIcons/Joomla.svg';
import Magento from '@/assets/svg/TooltipIcons/Magento.svg';
import Shopify from '@/assets/svg/TooltipIcons/Shopify.svg';
import Wix from '@/assets/svg/TooltipIcons/Wix.svg';
import WooCommerce from '@/assets/svg/TooltipIcons/WooCommerce.svg';
import WordPress from '@/assets/svg/TooltipIcons/WordPress.svg';
import Zapier from '@/assets/svg/TooltipIcons/Zapier.svg';

import { CardItem, ImageList } from './types';

export const SMALL_CARD_TEXT: string = 'smallCard';

export const SMALL_CARD_ITEM: CardItem = {
  type: 'smallCard',
  id: 'item_1',
  imageSrc: Ruby,
  text: 'unlimited_possibilities.cards_texts.text_for_cases',
  title: 'unlimited_possibilities.cards_headings.heading_public_api',
  alt: 'unlimited_possibilities.card_image_titles.title_for_first',
};

export const LARGE_CARD_ITEM: CardItem = {
  type: 'largeCard',
  id: 'card-item-3',
  imageSrc: WhyUsTemplatesIcon,
  title: 'why_us.headers.header_ready_templates',
  text: 'why_us.texts.text_you_have_store',
  alt: 'why_us.alt_image.alt_ready_templates',
};

export const imageList: ImageList[] = [
  { image: Wix, alt: 'Wix' },
  { image: WordPress, alt: 'WordPress' },
  { image: Zapier, alt: 'Zapier' },
  { image: Shopify, alt: 'Shopify' },
  { image: Magento, alt: 'Magento' },
  { image: Joomla, alt: 'Joomla' },
  { image: Drupal, alt: 'Drupal' },
  { image: WooCommerce, alt: 'WooCommerce' },
];
