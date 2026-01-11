import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Rooms } from './pages/rooms/rooms';
import { RoomDetail } from './pages/rooms/room-detail';
import { Gallery } from './pages/gallery/gallery';
import { Dining } from './pages/dining/dining';
import { Facilities } from './pages/facilities/facilities';
import { Contact } from './pages/contact/contact';
import { Booking } from './pages/booking/booking';
import { ExperienceLadakh } from './pages/experience-ladakh/experience-ladakh';
import { Attractions } from './pages/attractions/attractions';
import { Packages } from './pages/packages/packages';

export const routes: Routes = [
	{ path: '', component: Home, title: 'Reenam Hotel | Home' },
	{ path: 'rooms', component: Rooms, title: 'Reenam Hotel | Rooms & Suites' },
	{ path: 'rooms/:slug', component: RoomDetail, title: 'Reenam Hotel | Room details' },
	{ path: 'experience-ladakh', component: ExperienceLadakh, title: 'Reenam Hotel | Experience Ladakh' },
	{ path: 'gallery', component: Gallery, title: 'Reenam Hotel | Gallery' },
	{ path: 'attractions', component: Attractions, title: 'Reenam Hotel | Attractions' },
	{ path: 'packages', component: Packages, title: 'Reenam Hotel | Packages' },
	{ path: 'dining', component: Dining, title: 'Reenam Hotel | Dining' },
	{ path: 'facilities', component: Facilities, title: 'Reenam Hotel | Facilities' },
	{ path: 'contact', component: Contact, title: 'Reenam Hotel | Contact' },
	{ path: 'booking', component: Booking, title: 'Reenam Hotel | Booking' },
	{ path: '**', redirectTo: '' },
];
