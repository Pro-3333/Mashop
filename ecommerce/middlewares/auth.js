function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('<h1>Accès refusé</h1><p>Vous n\'avez pas la permission d\'accéder à cette page.</p>');
  }
}

module.exports = isAdmin; // export direct
