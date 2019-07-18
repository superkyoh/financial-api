module.exports = function ForbiddenResourceError(message = 'You dont have access to this resource') {
  this.name = 'ForbiddenResourceError';
  this.message = message;
};
