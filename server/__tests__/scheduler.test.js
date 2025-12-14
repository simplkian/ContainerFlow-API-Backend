import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldGenerateForDate } from '../scheduler.js';

test('DAILY schedules always generate tasks', () => {
  const schedule = { ruleType: 'DAILY' };
  const targetDate = new Date('2024-06-01T12:00:00Z');

  assert.equal(shouldGenerateForDate(schedule, targetDate, 'UTC'), true);
});

test('WEEKLY schedules respect weekday mapping and timezone', () => {
  const schedule = { ruleType: 'WEEKLY', weekdays: [1] };
  const utcSunday = new Date('2024-06-02T23:30:00Z');

  // Sunday in UTC should not match a Monday schedule
  assert.equal(shouldGenerateForDate(schedule, utcSunday, 'UTC'), false);

  // In Tokyo the same instant is already Monday
  assert.equal(shouldGenerateForDate(schedule, utcSunday, 'Asia/Tokyo'), true);
});

test('INTERVAL schedules honor everyNDays starting from startDate', () => {
  const start = new Date('2024-06-01T00:00:00Z');
  const schedule = { ruleType: 'INTERVAL', everyNDays: 3, startDate: start };

  const exactStart = new Date('2024-06-01T12:00:00Z');
  const onInterval = new Date('2024-06-04T12:00:00Z');
  const offInterval = new Date('2024-06-05T12:00:00Z');
  const beforeStart = new Date('2024-05-30T12:00:00Z');

  assert.equal(shouldGenerateForDate(schedule, exactStart, 'UTC'), true);
  assert.equal(shouldGenerateForDate(schedule, onInterval, 'UTC'), true);
  assert.equal(shouldGenerateForDate(schedule, offInterval, 'UTC'), false);
  assert.equal(shouldGenerateForDate(schedule, beforeStart, 'UTC'), false);
});
