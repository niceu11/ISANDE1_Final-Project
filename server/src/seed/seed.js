import 'dotenv/config';
import { connectDB } from '../db.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import CalendarNote from '../models/CalendarNote.js';

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
    eventDate: new Date('2026-08-12'),
    time: '4:00 PM – 10:00 PM',
    guestCount: 180,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-10'),
    featured: true,
    notes: [
      { date: new Date('2026-07-10'), author: 'Paula', text: 'Client confirmed venue and finalized guest count at 180 pax.' },
      { date: new Date('2026-07-05'), author: 'Paula', text: 'Follow-up call completed. Bride prefers peach and gold color motif.' },
      { date: new Date('2026-06-28'), author: 'Paula', text: 'Initial inquiry received via referral from Garcia family.' },
    ],
    suppliers: [
      { role: 'Catering',      company: 'La Mesa Catering',    contact: '+63 917 111 2222', status: 'confirmed' },
      { role: 'Florals',       company: 'Bloom & Petal Co.',   contact: '+63 920 333 4444', status: 'confirmed' },
      { role: 'Photographer',  company: 'Lens & Light Studio', contact: '+63 915 555 6666', status: 'confirmed' },
      { role: 'Sounds/AV',     company: 'SoundMax Events',     contact: '+63 918 777 8888', status: 'pending' },
      { role: 'Hair & Makeup', company: 'Glow Up Artists',     contact: '+63 916 999 0000', status: 'confirmed' },
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
    eventDate: new Date('2026-07-26'),
    guestCount: 150,
    coordinator: 'Miss Paula',
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-20'),
  },
  {
    clientName: 'Garcia Debut',
    contact: '+63 918 444 5555',
    email: 'garcia.debut@email.com',
    eventType: 'Debut – 18th Birthday',
    venue: 'Grand Ballroom',
    eventDate: new Date('2026-07-28'),
    guestCount: 120,
    status: 'pencil',
    contractStatus: 'pending',
    followupsCompleted: 2,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-22'),
  },
  {
    clientName: 'Cruz Anniversary',
    contact: '+63 919 666 7777',
    email: 'cruz.anniversary@email.com',
    eventType: 'Anniversary Celebration',
    venue: 'Terrace Hall',
    eventDate: new Date('2026-07-30'),
    guestCount: 80,
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-15'),
  },
  {
    clientName: 'Rivera Debut',
    contact: '+63 920 987 6543',
    email: 'rivera.debut@email.com',
    eventType: 'Debut – 18th Birthday',
    venue: 'Grand Ballroom',
    eventDate: new Date('2026-09-03'),
    guestCount: 100,
    status: 'confirmed',
    contractStatus: 'signed',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-12'),
  },
  {
    clientName: 'Lim & Co.',
    contact: '+63 921 111 2222',
    email: 'lim.co@email.com',
    eventType: 'Corporate Dinner',
    venue: '',
    eventDate: new Date('2026-10-15'),
    status: 'cold',
    contractStatus: 'pending',
    followupsCompleted: 3,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-18'),
  },
  {
    clientName: 'Cruz, Maria',
    contact: '+63 922 333 4444',
    email: 'maria.cruz@email.com',
    eventType: 'Debut',
    venue: '',
    eventDate: new Date('2026-11-20'),
    status: 'warm',
    contractStatus: 'pending',
    followupsCompleted: 0,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-26'),
  },
  {
    clientName: 'Tan Wedding',
    contact: '+63 923 555 6666',
    email: 'tan.wedding@email.com',
    eventType: 'Wedding Reception',
    venue: '',
    eventDate: new Date('2026-12-05'),
    status: 'hot',
    contractStatus: 'pending',
    followupsCompleted: 1,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-27'),
  },
  {
    clientName: 'Alvarez, Andrea',
    contact: '+63 924 777 8888',
    email: 'andrea.alvarez@email.com',
    eventType: 'Wedding Reception',
    venue: '',
    eventDate: new Date('2027-01-10'),
    status: 'warm',
    contractStatus: 'pending',
    followupsCompleted: 2,
    followupsTotal: 3,
    lastActivityAt: new Date('2026-07-24'),
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
    lastActivityAt: new Date('2026-07-13'),
  },
];

// Keyed by clientName so payments can be linked to the right event after insert.
const paymentsByClient = {
  'Santos Family': {
    totalAmount: 200000,
    downpayment: { amount: 50000, dueDate: new Date('2026-06-30'), status: 'verified', proofUploaded: true },
    balance:     { amount: 150000, dueDate: new Date('2026-07-15'), status: 'overdue', proofUploaded: false },
    history: [
      { label: 'Downpayment received',   date: new Date('2026-06-30'), amount: 50000, status: 'verified' },
      { label: 'Second payment overdue', date: new Date('2026-07-15'), amount: 25000, status: 'overdue' },
    ],
  },
  'Reyes Wedding': {
    totalAmount: 180000,
    downpayment: { amount: 45000, dueDate: new Date('2026-07-01'), status: 'verified', proofUploaded: true },
    balance:     { amount: 135000, dueDate: new Date('2026-08-20'), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment received', date: new Date('2026-07-01'), amount: 45000, status: 'verified' },
    ],
  },
  'Cruz Anniversary': {
    totalAmount: 90000,
    downpayment: { amount: 90000, dueDate: new Date('2026-06-15'), status: 'verified', proofUploaded: true },
    balance:     { amount: 0, dueDate: new Date('2026-06-15'), status: 'verified', proofUploaded: true },
    history: [
      { label: 'Full payment received', date: new Date('2026-06-15'), amount: 90000, status: 'verified' },
    ],
  },
  'Tan Wedding': {
    totalAmount: 120000,
    downpayment: { amount: 40000, dueDate: new Date('2026-07-10'), status: 'overdue', proofUploaded: false },
    balance:     { amount: 80000, dueDate: new Date('2026-12-01'), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment overdue', date: new Date('2026-07-10'), amount: 40000, status: 'overdue' },
    ],
  },
  'Lim & Co.': {
    totalAmount: 150000,
    downpayment: { amount: 40000, dueDate: new Date('2026-07-18'), status: 'pending', proofUploaded: true },
    balance:     { amount: 110000, dueDate: new Date('2026-10-01'), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment submitted, awaiting verification', date: new Date('2026-07-18'), amount: 40000, status: 'pending' },
    ],
  },
  'Garcia Debut': {
    totalAmount: 60000,
    downpayment: { amount: 20000, dueDate: new Date('2026-07-20'), status: 'pending', proofUploaded: true },
    balance:     { amount: 40000, dueDate: new Date('2026-07-25'), status: 'pending', proofUploaded: false },
    history: [
      { label: 'Downpayment submitted, awaiting verification', date: new Date('2026-07-20'), amount: 20000, status: 'pending' },
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
    { date: new Date('2026-07-28'), text: 'Site visit with Garcia Debut family at Grand Ballroom, 2 PM.', type: 'note', createdBy: 'Miss Paula', createdByRole: 'ae' },
    { date: new Date('2026-07-31'), text: 'Deadline: submit Q3 supplier contracts to Manager for review.', type: 'deadline', createdBy: 'Christine', createdByRole: 'manager' },
    { date: new Date('2026-08-01'), text: 'Office closed for team building — no client meetings scheduled.', type: 'announcement', createdBy: 'Rowena', createdByRole: 'ceo' },
  ];
  await CalendarNote.insertMany(calendarNotes);

  console.log(`Seeded ${users.length} users, ${insertedEvents.length} events, ${payments.length} payments, ${calendarNotes.length} calendar notes.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
