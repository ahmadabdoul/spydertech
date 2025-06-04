$(function () {
  // =====================================
  // Profit
  // =====================================
  var chart = {
    series: [
      {
        name: 'Earnings this month:',
        data: [355, 390, 300, 350, 390, 180, 355, 390],
      },
      {
        name: 'Expense this month:',
        data: [280, 250, 325, 215, 250, 310, 280, 250],
      },
    ],

    chart: {
      type: 'bar',
      height: 345,
      offsetX: -15,
      toolbar: { show: true },
      foreColor: '#adb0bb',
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },

    colors: ['#5D87FF', '#49BEFF'],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '35%',
        borderRadius: [6],
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
      },
    },
    markers: { size: 0 },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },

    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },

    xaxis: {
      type: 'category',
      categories: [
        '16/08',
        '17/08',
        '18/08',
        '19/08',
        '20/08',
        '21/08',
        '22/08',
        '23/08',
      ],
      labels: {
        style: { cssClass: 'grey--text lighten-2--text fill-color' },
      },
    },

    yaxis: {
      show: true,
      min: 0,
      max: 400,
      tickAmount: 4,
      labels: {
        style: {
          cssClass: 'grey--text lighten-2--text fill-color',
        },
      },
    },
    stroke: {
      show: true,
      width: 3,
      lineCap: 'butt',
      colors: ['transparent'],
    },

    tooltip: { theme: 'light' },

    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 3,
            },
          },
        },
      },
    ],
  };

  var chart = new ApexCharts(document.querySelector('#chart'), chart);
  chart.render();

  // =====================================
  // Breakup
  // =====================================
  var breakup = {
    color: '#adb5bd',
    series: [38, 40, 25],
    labels: ['2022', '2021', '2020'],
    chart: {
      width: 180,
      type: 'donut',
      fontFamily: "Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
    },
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
        },
      },
    },
    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
    colors: ['#5D87FF', '#ecf2ff', '#F9F9FD'],

    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 150,
          },
        },
      },
    ],
    tooltip: {
      theme: 'dark',
      fillSeriesColor: false,
    },
  };

  var chart = new ApexCharts(document.querySelector('#breakup'), breakup);
  chart.render();

  // =====================================
  // Earning
  // =====================================
  var earning = {
    chart: {
      id: 'sparkline3',
      type: 'area',
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
      fontFamily: "Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
    },
    series: [
      {
        name: 'Earnings',
        color: '#49BEFF',
        data: [25, 66, 20, 40, 12, 58, 20],
      },
    ],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: ['#f3feff'],
      type: 'solid',
      opacity: 0.05,
    },

    markers: {
      size: 0,
    },
    tooltip: {
      theme: 'dark',
      fixed: {
        enabled: true,
        position: 'right',
      },
      x: {
        show: false,
      },
    },
  };
  new ApexCharts(document.querySelector('#earning'), earning).render();
});
const url = localStorage.getItem('url');

async function listCourses() {
  try {
    const response = await fetch(`${url}student/list-courses.php?limit=4`);
    const resData = await response.json();
    console.log(resData.courses);
    console.log(resData.courses.length);
    const courseLength = document.querySelector('.courselength');

    courseLength.innerHTML = ` ${
      resData.courses.length ? resData.courses.length : 0
    }`;
    const data = resData.courses;
    data.forEach((item) => {
      const { title, description, teacher_username, id } = item;

      const listItems = document.createElement('li');
      const listEl = document.getElementById('listEl');
      listItems.innerHTML = title;
      listEl.appendChild(listItems);

      const courseId = document.getElementById('listEl-course-id');
      const listItemsId = document.createElement('li');
      listItemsId.innerHTML = id;

      courseId.appendChild(listItemsId);

      const teacherName = document.getElementById('teacherList');
      const teacherListEl = document.createElement('li');
      teacherListEl.innerHTML = teacher_username;
      teacherName.appendChild(teacherListEl);
    });

    if (!response.ok) {
      throw new Error(resData.description);
      return;
    }
    if (resData.status == 0) {
      console.log(resData.courses);
    } else {
      alert(resData.message);
    }
  } catch (error) {
    console.log(error);
  }
}

let user = sessionStorage.getItem('user');
user = JSON.parse(user);
user_id = user.id; // This is the student_id for the logged-in user

async function fetchUserProfile() {
    if (!user_id) {
        console.error('User ID not found for fetching profile.');
        return;
    }
    try {
        const response = await fetch(`${url}backend/student/get_user_profile.php?student_id=${user_id}`);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }
        const resData = await response.json();
        if (resData.status === 0 && resData.profile) {
            const walletBalanceDisplayEl = document.getElementById('wallet-balance-display');
            if (walletBalanceDisplayEl) {
                const wallet_balance = parseFloat(resData.profile.wallet_balance);
                walletBalanceDisplayEl.textContent = '$' + (isNaN(wallet_balance) ? '0.00' : wallet_balance.toFixed(2));
            }
        } else {
            console.error('Failed to fetch user profile:', resData.message);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

listCourses(); // For all available courses list

async function listActiveCourse() {
  try {
    const response = await fetch(
      `${url}student/get-student-courses.php?id=${user_id}` // user_id is the student_id here
    );
    if (!response.ok) {
        console.error(`HTTP error fetching student courses! status: ${response.status}`);
        return;
    }
    const resData = await response.json();

    const activeCoursesCountEl = document.querySelector('h1.activecourses'); // Element showing count of active courses
    if (activeCoursesCountEl) {
        activeCoursesCountEl.innerHTML = resData.courses && resData.courses.length ? resData.courses.length : 0;
    }

    const enrolledCoursesListDiv = document.getElementById('my-enrolled-courses-list');
    if (!enrolledCoursesListDiv) {
        console.error('#my-enrolled-courses-list element not found.');
        return;
    }
    enrolledCoursesListDiv.innerHTML = ''; // Clear previous content

    if (resData.status === 0 && resData.courses && resData.courses.length > 0) {
        resData.courses.forEach((item) => {
            const courseItemDiv = document.createElement('div');
            courseItemDiv.classList.add('enrolled-course-item', 'mb-3', 'p-3', 'border', 'rounded');

            const titleEl = document.createElement('h6');
            titleEl.classList.add('fw-semibold', 'mb-1');
            titleEl.textContent = item.course_title;
            courseItemDiv.appendChild(titleEl);

            const statusEl = document.createElement('small');
            statusEl.classList.add('text-muted', 'd-block', 'mb-1');
            statusEl.textContent = `Status: ${item.completion_status}`;
            if (item.completion_status === 'Completed') {
                statusEl.style.color = 'green';
            } else if (item.completion_status === 'In Progress') {
                statusEl.style.color = 'orange';
            }
            courseItemDiv.appendChild(statusEl);

            // Certificate Link Logic
            if (item.completion_status === 'Completed') {
                const certificateLink = document.createElement('a');
                certificateLink.href = `${url}backend/student/generate_certificate.php?course_id=${item.course_id}&student_id=${user_id}`;
                certificateLink.target = "_blank";
                certificateLink.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'mt-1');

                let linkText = 'Download Certificate';
                const parsedCertificateFee = parseFloat(item.certificate_fee);
                if (parsedCertificateFee > 0) {
                    linkText += ` (Fee: $${parsedCertificateFee.toFixed(2)})`;
                }
                certificateLink.textContent = linkText;
                courseItemDiv.appendChild(certificateLink);
            }
            enrolledCoursesListDiv.appendChild(courseItemDiv);
        });
    } else if (resData.status === 0) {
        enrolledCoursesListDiv.innerHTML = '<p>You are not enrolled in any courses yet.</p>';
    } else {
        console.error('Error fetching student courses:', resData.message);
        enrolledCoursesListDiv.innerHTML = '<p class="text-danger">Could not load your courses.</p>';
    }
  } catch (error) {
    console.error('Error in listActiveCourse function:', error);
    const enrolledCoursesListDiv = document.getElementById('my-enrolled-courses-list');
    if(enrolledCoursesListDiv) enrolledCoursesListDiv.innerHTML = '<p class="text-danger">An error occurred while loading your courses.</p>';
  }
}

fetchUserProfile(); // Call to fetch wallet balance
listActiveCourse(); // Call to list enrolled courses with certificate links
