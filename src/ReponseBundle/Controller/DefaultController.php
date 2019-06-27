<?php

namespace ReponseBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('ReponseBundle:Default:index.html.twig');
    }
}
