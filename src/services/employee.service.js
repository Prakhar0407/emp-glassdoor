const { User } = require('../models');
const Review = require('../models/review.model');
const ViewLog = require('../models/viewLog.model');

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
  { employmentStatus, jobTitle, employer, location, primaryIndustry, specialization, skills, workHistory, resume }
) => {
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') return null;

  if (employmentStatus) employee.employmentStatus = employmentStatus.trim();
  if (jobTitle) employee.jobTitle = jobTitle.trim();
  if (employer) employee.employer = employer.trim();
  if (location) employee.location = location.trim();
  if (primaryIndustry) employee.primaryIndustry = primaryIndustry.trim();
  if (specialization) employee.specialization = specialization.trim();
  if (skills) {
    if (!Array.isArray(skills)) throw new Error('Skills must be an array');
    employee.skills = skills.map((s) => s.trim().toLowerCase());
  }
  if (workHistory) {
    if (!Array.isArray(workHistory)) throw new Error('Work history must be an array');
    employee.workHistory = workHistory.map((job) => {
      const { company, position, startDate, endDate, employmentType, location, locationType, description } = job;

      if (!company || !position || !startDate) {
        throw new Error('Each work history entry must have company, position, and startDate');
      }

      return {
        company: company.trim(),
        position: position.trim(),
        startDate,
        endDate: endDate || null,
        employmentType: employmentType?.trim() || 'full time',
        location: location?.trim() || '',
        locationType: locationType?.trim() || 'onsite',
        description: description?.trim() || '',
      };
    });
  }
  if (resume) employee.resume = resume;
  await employee.save();
  return employee;
};

module.exports = {
  getEmployeeProfile,
  incrementProfileView,
  searchEmployees,
  updateEmployeeProfile,
};
