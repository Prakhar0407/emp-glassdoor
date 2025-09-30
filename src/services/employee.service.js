const { User } = require('../models');
const Review = require('../models/review.model');
const ViewLog = require('../models/viewLog.model');
const {
  EMPLOYMENT_STATUSES,
  JOB_TITLES,
  INDUSTRIES,
  SPECIALIZATIONS,
  LOCATIONS,
} = require('../constants/employee.constants');

const getEmployeeProfile = async (employeeId) => {
  const employee = await User.findById(employeeId).select('-password');
  if (!employee || employee.role !== 'employee') return null;

  const reviews = await Review.find({ employee: employeeId }).populate('employer', 'name email');

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    skills: employee.skills || [],
    profileViews: employee.profileViews || 0,
    reviews,
  };
};

const incrementProfileView = async (employeeId, viewerId) => {
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') return null;

  const viewer = await User.findById(viewerId);
  if (!viewer) return null;

  const viewerType = viewer.role === 'employer' ? 'employer' : 'employee';
  if (viewerType === 'employer') {
    employee.employerViews = (employee.employerViews || 0) + 1;
  } else {
    employee.employeeViews = (employee.employeeViews || 0) + 1;
  }
  await employee.save();

  await ViewLog.create({ employee: employeeId, viewer: viewerId, viewerType });
  return employee;
};

const searchEmployees = async (query) => {
  const { skills, name, email } = query;
  const filter = { role: 'employee' };

  if (skills) {
    const skillsArray = skills.split(',').map((s) => s.trim().toLowerCase());
    filter.skills = { $in: skillsArray };
  }
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };

  return User.find(filter).select('-password -__v');
};

const updateEmployeeProfile = async (
  employeeId,
  { employmentStatus, jobTitle, employer, location, primaryIndustry, specializations, skills, workHistory, resume }
) => {
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') return null;

  // Employment Status
  if (employmentStatus !== undefined) {
    const id = Number(employmentStatus);
    const found = EMPLOYMENT_STATUSES.find((s) => s.id === id);
    if (!found) throw new Error(`Invalid employment status`);
    employee.employmentStatus = found.label;
  }

  // Job Title
  if (jobTitle !== undefined) {
    const id = Number(jobTitle);
    const found = JOB_TITLES.find((j) => j.id === id);
    if (!found) throw new Error('Invalid job title');
    employee.jobTitle = found.label;
  }

  // Employer
  if (employer) employee.employer = employer.trim();

  // Location
  if (location !== undefined) {
    const id = Number(location);
    const found = LOCATIONS.find((l) => l.id === id);
    if (!found) throw new Error('Invalid location');
    employee.location = found.label;
  }

  // Primary Industry
  if (primaryIndustry !== undefined) {
    const id = Number(primaryIndustry);
    const found = INDUSTRIES.find((i) => i.id === id);
    if (!found) throw new Error('Invalid industry');
    employee.primaryIndustry = found.label;
  }

  // Specializations
  if (specializations !== undefined) {
    if (!Array.isArray(specializations)) throw new Error('Specializations must be an array');
    employee.specializations = specializations.map((id) => {
      const found = SPECIALIZATIONS.find((s) => s.id === Number(id));
      if (!found) throw new Error(`Invalid specialization ID: ${id}`);
      return found.label;
    });
  }

  // Skills
  if (skills) {
    if (!Array.isArray(skills)) throw new Error('Skills must be an array');
    employee.skills = skills.map((s) => s.trim().toLowerCase());
  }

  // Work History
  if (workHistory) {
    if (!Array.isArray(workHistory)) throw new Error('Work history must be an array');

    employee.workHistory = workHistory.map((job) => {
      const { company, position, startDate, endDate, employmentType, location, locationType, description } = job;

      if (!company || !position || !startDate) {
        throw new Error('Each work history entry must have company, position, and startDate');
      }

      let employmentTypeLabel = 'Full-Time';
      if (employmentType !== undefined) {
        const typeId = Number(employmentType);
        const foundType = EMPLOYMENT_STATUSES.find((s) => s.id === typeId);
        if (!foundType) throw new Error(`Invalid employment type ID: ${employmentType}`);
        employmentTypeLabel = foundType.label;
      }

      let locationLabel = '';
      if (location !== undefined) {
        const locId = Number(location);
        const foundLoc = LOCATIONS.find((l) => l.id === locId);
        if (!foundLoc) throw new Error(`Invalid location ID: ${location}`);
        locationLabel = foundLoc.label;
      }

      return {
        company: company.trim(),
        position: position.trim(),
        startDate,
        endDate: endDate || null,
        employmentType: employmentTypeLabel,
        location: locationLabel,
        locationType: locationType?.trim() || 'onsite',
        description: description?.trim() || '',
      };
    });
  }

  // Resume
  if (resume) employee.resume = resume;

  await employee.save();
  return employee;
};

const getProfileOptions = () => {
  return {
    employmentStatuses: EMPLOYMENT_STATUSES,
    jobTitles: JOB_TITLES,
    industries: INDUSTRIES,
    specializations: SPECIALIZATIONS,
    locations: LOCATIONS,
  };
};

module.exports = {
  getEmployeeProfile,
  incrementProfileView,
  searchEmployees,
  updateEmployeeProfile,
  getProfileOptions,
};
