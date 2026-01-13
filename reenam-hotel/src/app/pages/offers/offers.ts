import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [RouterLink, NgForOf],
  templateUrl: './offers.html',
  styleUrl: './offers.scss',
})
export class OffersCampaignPage {
  offers = [
    {
      id: 'early-bird',
      title: 'Early Bird Offer',
      summary: 'Save on your stay when you confirm bookings at least 30 days before arrival.',
      details: [
        'Applicable on direct bookings made 30+ days before check-in.',
        'Discount typically around 10–15% on the base room rate (EP plan).',
        'Valid on select room categories and for limited dates; blackout dates may apply.',
      ],
    },
    {
      id: 'family-package',
      title: 'Family Suite & Connecting Rooms',
      summary: 'Better value for families booking suites or multiple rooms together.',
      details: [
        'Complimentary breakfast on CP plan for Family Suite stays of 3 nights or more.',
        'Special value when booking a Family Suite together with one additional room.',
        'Ideal for groups of 4–6 guests travelling with children or elders.',
      ],
    },
    {
      id: 'seasonal-stays',
      title: 'Seasonal Stays (April–September)',
      summary: 'Suggested months and stay patterns to make the most of Ladakh weather.',
      details: [
        'Core operating season is from April to September each year.',
        'Early and late season may have limited room inventory and variable rates.',
        'For peak dates (May–July and key holidays), we recommend confirming well in advance.',
      ],
    },
  ];
}
