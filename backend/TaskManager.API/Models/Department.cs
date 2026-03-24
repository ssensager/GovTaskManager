namespace TaskManager.API.Models;

public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }

    public Department? ParentDepartment { get; set; }
    public ICollection<Department> ChildDepartments { get; set; } = new List<Department>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
