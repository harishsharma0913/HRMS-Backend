const validateDepartment = (req, res, next) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({status:false, error: "Valid department name is required" });
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({status:false, error: "Valid description is required" });
  }

  req.body.name = name.trim();
  req.body.description = description.trim();
  next(); 

};

module.exports = validateDepartment;
