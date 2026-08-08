import 'dotenv/config';
import { connectDB } from '../db.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import CalendarNote from '../models/CalendarNote.js';

// All event/payment/activity dates below are anchored to whenever this script
// actually runs, not hardcoded calendar dates - so "5 days overdue" or "followed
// up 2 days ago" stays true no matter how much later the seed is re-run before
// a demo. Re-run `npm run seed` right before presenting to refresh everything.
const NOW = new Date();
function daysFromNow(n) {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return d;
}

const users = [
  { name: 'Miss Paula', email: 'paula@soireeeventsplace.com', password: 'password123', role: 'ae', title: 'Account Executive' },
  { name: 'Christine',  email: 'christine@soireeeventsplace.com', password: 'password123', role: 'manager', title: 'Events Manager' },
  { name: 'Rowena',     email: 'rowena@soireeeventsplace.com', password: 'password123', role: 'ceo', title: 'CEO' },
  { name: 'Miguel',     email: 'miguel@soireeeventsplace.com', password: 'password123', role: 'staff', title: 'On-site Staff' },
];

const events = [
  {
    clientName: 'Santos Family',
    contact: '+63 917 123 4567',
    email: 'santos.family@email.com',
    eventType: 'Wedding Reception',
    venue: 'Garden Pavilion',
    eventDate: daysFromNow(4),
    time: '4:00 PM – 10:00 PM',
    guestCount: 180,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-2),
    featured: true,
    notes: [
      { date: daysFromNow(-2),  author: 'Paula', text: 'Client confirmed venue and finalized guest count at 180 pax.' },
      { date: daysFromNow(-7),  author: 'Paula', text: 'Follow-up call completed. Bride prefers peach and gold color motif.' },
      { date: daysFromNow(-14), author: 'Paula', text: 'Initial inquiry received via referral from Garcia family.' },
    ],
    suppliers: [
      { role: 'Catering',      company: 'La Mesa Catering',    contact: '+63 917 111 2222', status: 'confirmed' },
      { role: 'Florals',       company: 'Bloom & Petal Co.',   contact: '+63 920 333 4444', status: 'confirmed' },
      { role: 'Photographer',  company: 'Lens & Light Studio', contact: '+63 915 555 6666', status: 'confirmed' },
      {
        role: 'Sounds/AV', company: 'SoundMax Events', contact: '+63 918 777 8888', status: 'no-response',
        alternates: [
          { name: 'Beat & Bass Productions', contact: '+63 919 222 1010' },
          { name: 'Prime Audio Rentals',      contact: '+63 920 333 2020' },
        ],
      },
      { role: 'Hair & Makeup', company: 'Glow Up Artists',     contact: '+63 916 999 0000', status: 'confirmed' },
      { role: 'Cake & Desserts', company: 'Sweet Layers Bakeshop', contact: '+63 917 444 5050', status: 'pending' },
    ],
    instructions: [
      'Gates open at 3:00 PM for supplier setup. Guest arrival at 4:00 PM.',
      'Cocktail hour at the garden foyer — coordinate with florist for centerpiece placement by 3:30 PM.',
      'Strict no-flash photography policy during the ceremony. Relay to photo team.',
      'Client requested NO slideshow background music — check with AV team on arrival.',
      'Emergency contact for bride: +63 917 123 4567 (Ms. Santos). For groom: +63 920 987 6543.',
    ],
  },
  {
    clientName: 'Reyes Wedding',
    contact: '+63 917 222 3333',
    email: 'reyes.wedding@email.com',
    eventType: 'Wedding Ceremony',
    venue: 'Garden Pavilion',
    eventDate: daysFromNow(18),
    guestCount: 150,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-4),
  },
  {
    clientName: 'Garcia Debut',
    contact: '+63 918 444 5555',
    email: 'garcia.debut@email.com',
    eventType: 'Debut – 18th Birthday',
    venue: 'Grand Ballroom',
    eventDate: daysFromNow(20),
    guestCount: 120,
    status: 'pencil',
    contractStatus: 'pending',
    followupsCompleted: 2,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-3),
  },
  {
    clientName: 'Cruz Anniversary',
    contact: '+63 919 666 7777',
    email: 'cruz.anniversary@email.com',
    eventType: 'Anniversary Celebration',
    venue: 'Terrace Hall',
    eventDate: daysFromNow(22),
    guestCount: 80,
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-6),
  },
  {
    clientName: 'Rivera Debut',
    contact: '+63 920 987 6543',
    email: 'rivera.debut@email.com',
    eventType: 'Debut – 18th Birthday',
    venue: 'Grand Ballroom',
    eventDate: daysFromNow(26),
    guestCount: 100,
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-5),
  },
  {
    clientName: 'Lim & Co.',
    contact: '+63 921 111 2222',
    email: 'lim.co@email.com',
    eventType: 'Corporate Dinner',
    venue: '',
    eventDate: daysFromNow(68),
    status: 'cold',
    contractStatus: 'pending',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-20),
  },
  {
    clientName: 'Cruz, Maria',
    contact: '+63 922 333 4444',
    email: 'maria.cruz@email.com',
    eventType: 'Debut',
    venue: '',
    eventDate: daysFromNow(104),
    status: 'warm',
    contractStatus: 'pending',
    followupsCompleted: 0,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-6),
  },
  {
    clientName: 'Tan Wedding',
    contact: '+63 923 555 6666',
    email: 'tan.wedding@email.com',
    eventType: 'Wedding Reception',
    venue: '',
    eventDate: daysFromNow(119),
    status: 'hot',
    contractStatus: 'pending',
    followupsCompleted: 1,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-1),
  },
  {
    clientName: 'Alvarez, Andrea',
    contact: '+63 924 777 8888',
    email: 'andrea.alvarez@email.com',
    eventType: 'Wedding Reception',
    venue: '',
    eventDate: daysFromNow(155),
    status: 'warm',
    contractStatus: 'pending',
    followupsCompleted: 2,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-8),
  },
  {
    clientName: 'Reyes, Carla',
    contact: '+63 925 999 0000',
    email: 'carla.reyes@email.com',
    eventType: 'Wedding',
    venue: '',
    eventDate: undefined,
    status: 'cold',
    contractStatus: 'pending',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-25),
  },
  // Already-completed past bookings, so Reports/History have a real prior month
  // and prior period to compare against (not just upcoming events).
  {
    clientName: 'Ramos Baptism',
    contact: '+63 926 222 3344',
    email: 'ramos.baptism@email.com',
    eventType: 'Baptism Reception',
    venue: 'Terrace Hall',
    eventDate: daysFromNow(-25),
    guestCount: 70,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-25),
  },
  {
    clientName: 'Dela Torre Wedding',
    contact: '+63 927 444 5566',
    email: 'delatorre.wedding@email.com',
    eventType: 'Wedding Reception',
    venue: 'Grand Ballroom',
    eventDate: daysFromNow(-95),
    guestCount: 160,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: daysFromNow(-95),
  },
];

// Keyed by clientName so payments can be linked to the right event after insert.
const paymentsByClient = {
  'Santos Family': {
    totalAmount: 200000,
    downpayment: { amount: 50000, dueDate: daysFromNow(-30), status: 'verified', proofUploaded: true },
    balance:     { amount: 150000, dueDate: daysFromNow(-5), status: 'overdue', proofUploaded: false },
    history: [
      { label: 'Downpayment received',   date: daysFromNow(-30), amount: 50000, status: 'verified' },
      { label: 'Second payment overdue', date: daysFromNow(-5),  amount: 25000, status: 'overdue' },
    ],
  },
  'Reyes Wedding': {
    totalAmount: 180000,
    downpayment: { amount: 45000, dueDate: daysFromNow(-25), status: 'verified', proofUploaded: true },
    balance:     { amount: 135000, dueDate: daysFromNow(12), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment received', date: daysFromNow(-25), amount: 45000, status: 'verified' },
    ],
  },
  'Cruz Anniversary': {
    totalAmount: 90000,
    downpayment: { amount: 90000, dueDate: daysFromNow(-14), status: 'verified', proofUploaded: true },
    balance:     { amount: 0, dueDate: daysFromNow(-14), status: 'verified', proofUploaded: true },
    history: [
      { label: 'Full payment received', date: daysFromNow(-14), amount: 90000, status: 'verified' },
    ],
  },
  'Tan Wedding': {
    totalAmount: 120000,
    downpayment: { amount: 40000, dueDate: daysFromNow(-2), status: 'overdue', proofUploaded: false },
    balance:     { amount: 80000, dueDate: daysFromNow(110), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment overdue', date: daysFromNow(-2), amount: 40000, status: 'overdue' },
    ],
  },
  'Lim & Co.': {
    totalAmount: 150000,
    downpayment: { amount: 40000, dueDate: daysFromNow(-10), status: 'pending', proofUploaded: true },
    balance:     { amount: 110000, dueDate: daysFromNow(55), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment submitted, awaiting verification', date: daysFromNow(-10), amount: 40000, status: 'pending' },
    ],
  },
  'Garcia Debut': {
    totalAmount: 60000,
    downpayment: { amount: 20000, dueDate: daysFromNow(-3), status: 'pending', proofUploaded: true },
    balance:     { amount: 40000, dueDate: daysFromNow(5), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment submitted, awaiting verification', date: daysFromNow(-3), amount: 20000, status: 'pending' },
    ],
  },
  'Ramos Baptism': {
    totalAmount: 70000,
    downpayment: { amount: 70000, dueDate: daysFromNow(-30), status: 'verified', proofUploaded: true },
    balance:     { amount: 0, dueDate: daysFromNow(-30), status: 'verified', proofUploaded: true },
    history: [
      { label: 'Full payment received', date: daysFromNow(-30), amount: 70000, status: 'verified' },
    ],
  },
  'Dela Torre Wedding': {
    totalAmount: 210000,
    downpayment: { amount: 60000, dueDate: daysFromNow(-100), status: 'verified', proofUploaded: true },
    balance:     { amount: 150000, dueDate: daysFromNow(-96), status: 'verified', proofUploaded: true },
    history: [
      { label: 'Downpayment received', date: daysFromNow(-100), amount: 60000, status: 'verified' },
      { label: 'Balance received',     date: daysFromNow(-96),  amount: 150000, status: 'verified' },
    ],
  },
};

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Payment.deleteMany({}),
    CalendarNote.deleteMany({}),
  ]);

  await User.insertMany(users);
  const insertedEvents = await Event.insertMany(events);

  const payments = insertedEvents
    .filter(ev => paymentsByClient[ev.clientName])
    .map(ev => ({
      eventId: ev._id,
      clientName: ev.clientName,
      eventDate: ev.eventDate,
      ...paymentsByClient[ev.clientName],
    }));

  await Payment.insertMany(payments);

  const calendarNotes = [
    { date: daysFromNow(16), text: 'Site visit with Garcia Debut family at Grand Ballroom, 2 PM.', type: 'note', createdBy: 'Miss Paula', createdByRole: 'ae' },
    { date: daysFromNow(3),  text: 'Deadline: submit Q3 supplier contracts to Manager for review.', type: 'deadline', createdBy: 'Christine', createdByRole: 'manager' },
    { date: daysFromNow(10), text: 'Office closed for team building — no client meetings scheduled.', type: 'announcement', createdBy: 'Rowena', createdByRole: 'ceo' },
  ];
  await CalendarNote.insertMany(calendarNotes);

  console.log(`Seeded ${users.length} users, ${insertedEvents.length} events, ${payments.length} payments, ${calendarNotes.length} calendar notes.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
