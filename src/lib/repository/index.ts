import * as excelRepository from "@/lib/excel/repository";
import * as supabaseRepository from "@/lib/supabase/repository";

const useSupabase =
  Boolean(process.env.SUPABASE_URL?.trim()) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

const repository: typeof supabaseRepository = useSupabase
  ? supabaseRepository
  : (excelRepository as unknown as typeof supabaseRepository);

export type AdminUserSummary = supabaseRepository.AdminUserSummary;

export const isDatabaseReady = () =>
  useSupabase ? supabaseRepository.isDatabaseReady() : excelRepository.isExcelBackendReady();
export const isExcelBackendReady = () =>
  useSupabase ? supabaseRepository.isExcelBackendReady() : excelRepository.isExcelBackendReady();

export const findUserByEmail = repository.findUserByEmail;
export const findUserById = repository.findUserById;
export const createUser = repository.createUser;
export const verifyPassword = repository.verifyPassword;
export const getProfileById = repository.getProfileById;
export const updateUserDisplayName = repository.updateUserDisplayName;
export const updateUserProfile = repository.updateUserProfile;
export const updateUserAvatar = repository.updateUserAvatar;
export const getAdminUserList = repository.getAdminUserList;
export const countAdmins = repository.countAdmins;
export const updateUserRole = repository.updateUserRole;
export const getLatestMembershipApplicationForUser =
  repository.getLatestMembershipApplicationForUser;
export const getAllMembershipApplications = repository.getAllMembershipApplications;
export const createMembershipApplication = repository.createMembershipApplication;
export const approveMembershipApplication = repository.approveMembershipApplication;
export const rejectMembershipApplication = repository.rejectMembershipApplication;
export const getSiteSettings = repository.getSiteSettings;
export const updateSiteSettings = repository.updateSiteSettings;
export const getGiveaways = repository.getGiveaways;
export const getAllGiveaways = repository.getAllGiveaways;
export const getActiveGiveaways = repository.getActiveGiveaways;
export const getGiveawayEntryIdsForUser = repository.getGiveawayEntryIdsForUser;
export const getGiveawayById = repository.getGiveawayById;
export const createGiveaway = repository.createGiveaway;
export const updateGiveaway = repository.updateGiveaway;
export const deleteGiveaway = repository.deleteGiveaway;
export const getGiveawayEntriesForUser = repository.getGiveawayEntriesForUser;
export const hasGiveawayEntry = repository.hasGiveawayEntry;
export const createGiveawayEntry = repository.createGiveawayEntry;
export const countGiveawayEntries = repository.countGiveawayEntries;
export const getMeetGreetEvents = repository.getMeetGreetEvents;
export const getAllMeetGreetEvents = repository.getAllMeetGreetEvents;
export const getMeetGreetEventById = repository.getMeetGreetEventById;
export const createMeetGreetEvent = repository.createMeetGreetEvent;
export const updateMeetGreetEvent = repository.updateMeetGreetEvent;
export const deleteMeetGreetEvent = repository.deleteMeetGreetEvent;
export const getRegistrationsForUser = repository.getRegistrationsForUser;
export const getRegistrationForUser = repository.getRegistrationForUser;
export const countConfirmedRegistrations = repository.countConfirmedRegistrations;
export const createMeetGreetRegistration = repository.createMeetGreetRegistration;
export const getCommunities = repository.getCommunities;
export const getAllCommunities = repository.getAllCommunities;
export const createCommunity = repository.createCommunity;
export const updateCommunity = repository.updateCommunity;
export const deleteCommunity = repository.deleteCommunity;
export const getContactLinks = repository.getContactLinks;
export const getAllContactLinks = repository.getAllContactLinks;
export const createContactLink = repository.createContactLink;
export const updateContactLink = repository.updateContactLink;
export const deleteContactLink = repository.deleteContactLink;
export const getAllSiteButtons = repository.getAllSiteButtons;
export const updateSiteButton = repository.updateSiteButton;
export const getMessagesForUser = repository.getMessagesForUser;
export const countMessagesForUser = repository.countMessagesForUser;
export const getNotificationsForUser = repository.getNotificationsForUser;
export const countUnreadNotifications = repository.countUnreadNotifications;
export const getFansForMessaging = repository.getFansForMessaging;
export const sendAdminMessage = repository.sendAdminMessage;
export const notifyAllFansAbout = repository.notifyAllFansAbout;
export const createWelcomeContentForUser = repository.createWelcomeContentForUser;
export const markMessageAsRead = repository.markMessageAsRead;
export const markNotificationAsRead = repository.markNotificationAsRead;
export const getAdminStats = repository.getAdminStats;
